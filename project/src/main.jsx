import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import CustomKanban from "../../calendar/src/kanban_components/CustomKanban";

const CLIENT_ID = "202613106187-1i1b5444iae4ju0m5on5b0jr6dqon9n3.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <App/>
        </GoogleOAuthProvider>
    </React.StrictMode>
);
