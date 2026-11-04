-- EcoCredits transactional operations. Applied to Supabase project ihxeivcwgbsnyximuzna.
-- Keep all balance, stock, and role mutations server-side.
create or replace function public.create_ec_submission(p_category_id text,p_estimated_weight numeric,p_collection_method ec_collection,p_pickup_address text default null)
returns public.submissions language plpgsql security definer set search_path=public as $$
declare v_row public.submissions;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if p_estimated_weight<=0 then raise exception 'Weight must be positive'; end if;
 if p_collection_method='HOME_PICKUP' and coalesce(trim(p_pickup_address),'')='' then raise exception 'Pickup address required'; end if;
 if not exists(select 1 from public.categories c where c.id=p_category_id and c.active and p_estimated_weight>=c.minimum_weight) then raise exception 'Category inactive or weight below minimum'; end if;
 insert into public.submissions(user_id,category_id,estimated_weight,collection_method,pickup_address)
 values(auth.uid(),p_category_id,p_estimated_weight,p_collection_method,case when p_collection_method='HOME_PICKUP' then trim(p_pickup_address) else null end) returning * into v_row;
 return v_row;
end $$;

create or replace function public.staff_verify_ec_submission(p_submission_id uuid,p_verified_weight numeric,p_grade ec_quality)
returns public.submissions language plpgsql security definer set search_path=public as $$
declare v_row public.submissions; v_cat public.categories; v_credits numeric; v_balance numeric;
begin
 if public.current_ec_role() not in ('ADMIN','COLLECTION_AGENT') then raise exception 'Staff only'; end if;
 if p_verified_weight<=0 then raise exception 'Verified weight must be positive'; end if;
 select * into v_row from public.submissions where id=p_submission_id for update;
 if not found or v_row.status in ('CREDITED','REJECTED') then raise exception 'Submission missing or finalized'; end if;
 select * into v_cat from public.categories where id=v_row.category_id;
 if not found or p_verified_weight<v_cat.minimum_weight then raise exception 'Weight below minimum'; end if;
 v_credits:=round(p_verified_weight*v_cat.credit_per_kg*case p_grade when 'GRADE_A' then 1.2 when 'GRADE_B' then 1.0 else 0.7 end,2);
 update public.wallets set available_balance=available_balance+v_credits,updated_at=now() where user_id=v_row.user_id returning available_balance into v_balance;
 if not found then raise exception 'Wallet not found'; end if;
 update public.submissions set status='CREDITED',quality_grade=p_grade,verified_weight=p_verified_weight,final_credits=v_credits,credited_at=now() where id=p_submission_id returning * into v_row;
 insert into public.ledger(user_id,transaction_type,amount,reference_type,reference_id,balance_after) values(v_row.user_id,'WASTE_REWARD',v_credits,'WASTE_SUBMISSION',v_row.id::text,v_balance);
 return v_row;
end $$;

create or replace function public.staff_reject_ec_submission(p_submission_id uuid,p_reason text default null)
returns public.submissions language plpgsql security definer set search_path=public as $$
declare v_row public.submissions;
begin
 if public.current_ec_role() not in ('ADMIN','COLLECTION_AGENT') then raise exception 'Staff only'; end if;
 update public.submissions set status='REJECTED',rejection_reason=nullif(trim(p_reason),''),rejected_at=now(),rejected_by=auth.uid()
 where id=p_submission_id and status not in ('CREDITED','REJECTED') returning * into v_row;
 if not found then raise exception 'Submission missing or finalized'; end if; return v_row;
end $$;

create or replace function public.redeem_ec_product(p_product_id text)
returns public.redemptions language plpgsql security definer set search_path=public as $$
declare v_product public.products; v_wallet public.wallets; v_row public.redemptions; v_balance numeric;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select * into v_product from public.products where id=p_product_id and active and stock_quantity>0 for update;
 if not found then raise exception 'Product unavailable'; end if;
 select * into v_wallet from public.wallets where user_id=auth.uid() for update;
 if not found or v_wallet.available_balance<v_product.credit_price then raise exception 'Insufficient EcoCredits'; end if;
 update public.wallets set available_balance=available_balance-v_product.credit_price,locked_balance=locked_balance+v_product.credit_price,updated_at=now()
 where user_id=auth.uid() returning available_balance into v_balance;
 update public.products set stock_quantity=stock_quantity-1 where id=p_product_id;
 insert into public.redemptions(user_id,product_id,credits,status,token,otp,expires_at)
 values(auth.uid(),p_product_id,v_product.credit_price,'PENDING',gen_random_uuid()::text,lpad((floor(random()*900000)+100000)::int::text,6,'0'),now()+interval '30 minutes') returning * into v_row;
 insert into public.ledger(user_id,transaction_type,amount,reference_type,reference_id,balance_after) values(auth.uid(),'REDEMPTION_HOLD',-v_product.credit_price,'REDEMPTION',v_row.id::text,v_balance);
 return v_row;
end $$;

create or replace function public.complete_ec_redemption(p_redemption_id uuid,p_otp text)
returns public.redemptions language plpgsql security definer set search_path=public as $$
declare v_row public.redemptions; v_wallet public.wallets;
begin
 select * into v_row from public.redemptions where id=p_redemption_id and user_id=auth.uid() for update;
 if not found or v_row.status<>'PENDING' then raise exception 'Redemption not pending'; end if;
 if v_row.expires_at<now() then raise exception 'Redemption expired'; end if;
 if v_row.otp<>trim(p_otp) then raise exception 'Invalid OTP'; end if;
 update public.wallets set locked_balance=greatest(0,locked_balance-v_row.credits),updated_at=now() where user_id=auth.uid() returning * into v_wallet;
 update public.redemptions set status='COMPLETED',completed_at=now() where id=p_redemption_id returning * into v_row;
 insert into public.ledger(user_id,transaction_type,amount,reference_type,reference_id,balance_after) values(auth.uid(),'REDEMPTION_COMPLETED',0,'REDEMPTION',v_row.id::text,v_wallet.available_balance);
 return v_row;
end $$;

create or replace function public.cancel_ec_redemption(p_redemption_id uuid)
returns public.redemptions language plpgsql security definer set search_path=public as $$
declare v_row public.redemptions; v_wallet public.wallets;
begin
 select * into v_row from public.redemptions where id=p_redemption_id and user_id=auth.uid() for update;
 if not found or v_row.status<>'PENDING' then raise exception 'Redemption not pending'; end if;
 update public.wallets set available_balance=available_balance+v_row.credits,locked_balance=greatest(0,locked_balance-v_row.credits),updated_at=now()
 where user_id=auth.uid() returning * into v_wallet;
 update public.products set stock_quantity=stock_quantity+1 where id=v_row.product_id;
 update public.redemptions set status='CANCELLED' where id=p_redemption_id returning * into v_row;
 insert into public.ledger(user_id,transaction_type,amount,reference_type,reference_id,balance_after) values(auth.uid(),'REDEMPTION_RELEASE',v_row.credits,'REDEMPTION',v_row.id::text,v_wallet.available_balance);
 return v_row;
end $$;

create or replace function public.admin_update_ec_profile_role(p_user_id uuid,p_role ec_role)
returns public.profiles language plpgsql security definer set search_path=public as $$
declare v_row public.profiles;
begin
 if public.current_ec_role()<>'ADMIN' then raise exception 'Admin only'; end if;
 if p_user_id=auth.uid() and p_role<>'ADMIN' then raise exception 'Cannot demote yourself'; end if;
 if (select count(*) from public.profiles where role='ADMIN')<=1 and exists(select 1 from public.profiles where id=p_user_id and role='ADMIN') and p_role<>'ADMIN' then raise exception 'Cannot demote last admin'; end if;
 update public.profiles set role=p_role,updated_at=now() where id=p_user_id returning * into v_row;
 if not found then raise exception 'Profile not found'; end if; return v_row;
end $$;

create or replace function public.admin_update_ec_category(p_id text,p_rate numeric,p_active boolean)
returns public.categories language plpgsql security definer set search_path=public as $$
declare v_row public.categories;
begin
 if public.current_ec_role()<>'ADMIN' then raise exception 'Admin only'; end if;
 if p_rate<0 then raise exception 'Rate must be nonnegative'; end if;
 update public.categories set credit_per_kg=p_rate,active=p_active where id=p_id returning * into v_row;
 if not found then raise exception 'Category not found'; end if; return v_row;
end $$;

create or replace function public.admin_update_ec_product(p_id text,p_name text,p_blurb text,p_price numeric,p_stock integer,p_active boolean)
returns public.products language plpgsql security definer set search_path=public as $$
declare v_row public.products;
begin
 if public.current_ec_role()<>'ADMIN' then raise exception 'Admin only'; end if;
 if p_price<0 or p_stock<0 then raise exception 'Price and stock must be nonnegative'; end if;
 update public.products set name=p_name,blurb=p_blurb,credit_price=p_price,stock_quantity=p_stock,active=p_active where id=p_id returning * into v_row;
 if not found then raise exception 'Product not found'; end if; return v_row;
end $$;

create or replace function public.update_ec_profile_name(p_full_name text)
returns public.profiles language plpgsql security definer set search_path=public as $$
declare v_row public.profiles;
begin
 if auth.uid() is null or trim(coalesce(p_full_name,''))='' then raise exception 'Name required'; end if;
 update public.profiles set full_name=trim(p_full_name),updated_at=now() where id=auth.uid() returning * into v_row;
 return v_row;
end $$;

revoke all on function public.create_ec_submission(text,numeric,ec_collection,text) from public,anon;
revoke all on function public.staff_verify_ec_submission(uuid,numeric,ec_quality) from public,anon;
revoke all on function public.staff_reject_ec_submission(uuid,text) from public,anon;
revoke all on function public.redeem_ec_product(text) from public,anon;
revoke all on function public.complete_ec_redemption(uuid,text) from public,anon;
revoke all on function public.cancel_ec_redemption(uuid) from public,anon;
revoke all on function public.admin_update_ec_profile_role(uuid,ec_role) from public,anon;
revoke all on function public.admin_update_ec_category(text,numeric,boolean) from public,anon;
revoke all on function public.admin_update_ec_product(text,text,text,numeric,integer,boolean) from public,anon;
revoke all on function public.update_ec_profile_name(text) from public,anon;
grant execute on function public.create_ec_submission(text,numeric,ec_collection,text) to authenticated;
grant execute on function public.staff_verify_ec_submission(uuid,numeric,ec_quality) to authenticated;
grant execute on function public.staff_reject_ec_submission(uuid,text) to authenticated;
grant execute on function public.redeem_ec_product(text) to authenticated;
grant execute on function public.complete_ec_redemption(uuid,text) to authenticated;
grant execute on function public.cancel_ec_redemption(uuid) to authenticated;
grant execute on function public.admin_update_ec_profile_role(uuid,ec_role) to authenticated;
grant execute on function public.admin_update_ec_category(text,numeric,boolean) to authenticated;
grant execute on function public.admin_update_ec_product(text,text,text,numeric,integer,boolean) to authenticated;
grant execute on function public.update_ec_profile_name(text) to authenticated;

revoke all privileges on public.profiles,public.wallets,public.categories,public.products,public.submissions,public.ledger,public.redemptions from anon,authenticated;
grant select on public.profiles,public.wallets,public.categories,public.products,public.submissions,public.ledger,public.redemptions to authenticated;
