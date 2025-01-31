import PayTabs from "paytabs_pt2";
import env from "env";

env.config();

let
    profileID = process.env.PAYTABS_PROFILE_ID,
    serverKey = process.env.PAYTABS_SECRET_KEY,
    region = "EGY";

PayTabs.setConfig( profileID, serverKey, region);
