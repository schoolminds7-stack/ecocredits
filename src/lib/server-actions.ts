import { supabase } from "@/lib/supabase";
import { useEcoStore } from "@/lib/store";
import type { Category, Product, Submission, LedgerEntry, Redemption, User, Wallet, Role } from "@/lib/types";

const mapCategory=(r:any):Category=>({id:r.id,name:r.name,description:r.description??"",unit:"KG",creditPerKg:Number(r.credit_per_kg),minimumWeight:Number(r.minimum_weight),active:r.active});
const mapProduct=(r:any):Product=>({id:r.id,name:r.name,blurb:r.blurb??"",creditPrice:Number(r.credit_price),stockQuantity:r.stock_quantity,active:r.active});
const mapSubmission=(r:any):Submission=>({id:r.id,userId:r.user_id,categoryId:r.category_id,estimatedWeight:Number(r.estimated_weight),collectionMethod:r.collection_method,pickupAddress:r.pickup_address,status:r.status,qualityGrade:r.quality_grade,verifiedWeight:r.verified_weight==null?null:Number(r.verified_weight),finalCredits:r.final_credits==null?null:Number(r.final_credits),createdAt:r.created_at,creditedAt:r.credited_at});
const mapLedger=(r:any):LedgerEntry=>({id:r.id,userId:r.user_id,transactionType:r.transaction_type,amount:Number(r.amount),referenceType:r.reference_type??"",referenceId:r.reference_id??"",balanceAfter:Number(r.balance_after??0),createdAt:r.created_at});
const mapRedemption=(r:any):Redemption=>({id:r.id,userId:r.user_id,productId:r.product_id,credits:Number(r.credits),status:r.status,token:r.token,otp:r.otp,expiresAt:r.expires_at,createdAt:r.created_at,completedAt:r.completed_at});
export async function refreshEcoData() {
 const [profiles,wallets,categories,products,submissions,ledger,redemptions]=await Promise.all([
  supabase.from("profiles").select("id,full_name,phone,role,status"),
  supabase.from("wallets").select("user_id,available_balance,locked_balance"),
  supabase.from("categories").select("*").order("name"),
  supabase.from("products").select("*").order("name"),
  supabase.from("submissions").select("*").order("created_at",{ascending:false}),
  supabase.from("ledger").select("*").order("created_at",{ascending:false}),
  supabase.from("redemptions").select("*").order("created_at",{ascending:false}),
 ]);
 for(const x of [profiles,wallets,categories,products,submissions,ledger,redemptions]) if(x.error) throw x.error;
 const users:User[]=(profiles.data??[]).map((r:any)=>({id:r.id,fullName:r.full_name??"EcoCredits User",phone:r.phone??"",password:"",role:r.role as Role,status:r.status}));
 const walletRows:Wallet[]=(wallets.data??[]).map((r:any)=>({userId:r.user_id,availableBalance:Number(r.available_balance),lockedBalance:Number(r.locked_balance)}));
 const current=useEcoStore.getState();
 useEcoStore.setState({users,wallets:walletRows,categories:(categories.data??[]).map(mapCategory),products:(products.data??[]).map(mapProduct),submissions:(submissions.data??[]).map(mapSubmission),ledger:(ledger.data??[]).map(mapLedger),redemptions:(redemptions.data??[]).map(mapRedemption),sessionUserId:current.sessionUserId});
}
async function rpc(name:string,args:Record<string,unknown>={}) {
 const {data,error}=await supabase.rpc(name,args); if(error) throw error; await refreshEcoData(); return data;
}
export const serverActions={
 createSubmission:(input:{categoryId:string;estimatedWeight:number;collectionMethod:string;pickupAddress?:string|null})=>rpc("create_ec_submission",{p_category_id:input.categoryId,p_estimated_weight:input.estimatedWeight,p_collection_method:input.collectionMethod,p_pickup_address:input.pickupAddress??null}),
 verifySubmission:(id:string,weight:number,grade:string)=>rpc("staff_verify_ec_submission",{p_submission_id:id,p_verified_weight:weight,p_grade:grade}),
 rejectSubmission:(id:string)=>rpc("staff_reject_ec_submission",{p_submission_id:id,p_reason:null}),
 redeem:(productId:string)=>rpc("redeem_ec_product",{p_product_id:productId}),
 completeRedemption:(id:string,otp:string)=>rpc("complete_ec_redemption",{p_redemption_id:id,p_otp:otp}),
 cancelRedemption:(id:string)=>rpc("cancel_ec_redemption",{p_redemption_id:id}),
 updateRole:(id:string,role:string)=>rpc("admin_update_ec_profile_role",{p_user_id:id,p_role:role}),
 updateCategory:(id:string,rate:number,active:boolean)=>rpc("admin_update_ec_category",{p_id:id,p_rate:rate,p_active:active}),
 updateProduct:(id:string,name:string,blurb:string,price:number,stock:number,active:boolean)=>rpc("admin_update_ec_product",{p_id:id,p_name:name,p_blurb:blurb,p_price:price,p_stock:stock,p_active:active}),
 updateProfile:(name:string)=>rpc("update_ec_profile_name",{p_full_name:name}),
};
