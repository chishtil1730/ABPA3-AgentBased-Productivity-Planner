import { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { gapi } from "gapi-script";

const API_KEY = process.env.API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export function useGoogleCalendar(range = "week") {
    const [events, setEvents] = useState([]);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    /* Load GAPI */
    useEffect(() => {
        gapi.load("client", async () => {
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [
                    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                ],
            });
        });
    }, []);

    /* Silent login */
    const login = useGoogleLogin({
        scope: SCOPES,
        onSuccess: (tokenResponse) => {
            setToken(tokenResponse.access_token);
        },
        onError: (err) => {
            console.error("Google login failed", err);
            setLoading(false);
        },
    });

    useEffect(() => {
        login({ prompt: "none" });
    }, []);

    /* Load events when token or range changes */
    useEffect(() => {
        if (!token) return;

        gapi.client.setToken({ access_token: token });
        loadEvents(range);
    }, [token, range]);

    const getTimeRange = (type) => {
        const now = new Date();
        const end = new Date(now);

        if (type === "week") end.setDate(now.getDate() + 7);
        if (type === "month") end.setMonth(now.getMonth() + 1);

        return {
            timeMin: now.toISOString(),
            timeMax: end.toISOString(),
        };
    };

    const loadEvents = async (type) => {
        setLoading(true);

        const { timeMin, timeMax } = getTimeRange(type);

        const res = await gapi.client.calendar.events.list({
            calendarId: "primary",
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 10,
        });

        setEvents(res.result.items || []);
        setLoading(false);
    };

    return { events, loading };
}
