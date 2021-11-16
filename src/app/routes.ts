import authRouteLoader from "../routes/api/auth-routes";
import error404 from "../routes/404";
import error500 from "../routes/500";
import verifyEmail from "../routes/api/verify-email";
import resetPassword from "../routes/api/reset-password";
import eventRoutes from "../routes/api/event-routes";

// loaders will be called in the defined order
const routes = [
    authRouteLoader,
    verifyEmail,
    resetPassword,
    eventRoutes,
    error404,
    error500,
];

export default routes;
