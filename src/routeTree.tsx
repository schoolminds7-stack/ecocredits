import { Route as rootRoute } from "./routes/__root";
import { Route as IndexRoute } from "./routes/index";
import { Route as HomeRoute } from "./routes/home";
import { Route as SubmitRoute } from "./routes/submit";
import { Route as MarketRoute } from "./routes/market";
import { Route as WalletRoute } from "./routes/wallet";
import { Route as AdminRoute } from "./routes/admin";
import { Route as ProfileRoute } from "./routes/profile";
import { Route as RedeemRoute } from "./routes/redeem.$productId";
import { Route as FlossRoute } from "./routes/floss";
import { Route as JugRoute } from "./routes/jug";
import { Route as CollarRoute } from "./routes/collar";

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  HomeRoute,
  SubmitRoute,
  MarketRoute,
  WalletRoute,
  AdminRoute,
  ProfileRoute,
  RedeemRoute,
  FlossRoute,
  JugRoute,
  CollarRoute,
]);
