import React, { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { gapi } from "gapi-script";

const API_KEY = process.env.API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export default function Calendar() {
    const [events, setEvents] = useState([]);
    const [token, setToken] = useState(null);
    const [range, setRange] = useState("week"); // week | month

    /* -------------------- Load GAPI -------------------- */
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

    /* -------------------- Silent Login -------------------- */
    const login = useGoogleLogin({
        scope: SCOPES,
        onSuccess: (tokenResponse) => {
            setToken(tokenResponse.access_token);
        },
        onError: (error) => {
            console.error("Login failed", error);
        },
    });

    // Try silent login on mount
    useEffect(() => {
        login({ prompt: "none" });
    }, []);

    /* -------------------- When token changes -------------------- */
    useEffect(() => {
        if (token) {
            gapi.client.setToken({ access_token: token });
            loadEvents(range);
        }
    }, [token, range]);

    /* -------------------- Date Range Helper -------------------- */
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

    /* -------------------- Load Events -------------------- */
    const loadEvents = async (type) => {
        const { timeMin, timeMax } = getTimeRange(type);

        const res = await gapi.client.calendar.events.list({
            calendarId: "primary",
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 50,
        });

        setEvents(res.result.items || []);
    };

    /* -------------------- UI -------------------- */
    return (
        <div>
            {!token ? (
                <button onClick={() => login()}>Sign in with Google</button>
            ) : (
                <div>
                    <h2>Your Events</h2>

                    <div style={{ marginBottom: 12 }}>
                        <button onClick={() => setRange("week")}>This Week</button>
                        <button onClick={() => setRange("month")} style={{ marginLeft: 8 }}>
                            This Month
                        </button>
                    </div>

                    {events.length === 0 && <p>No events found.</p>}

                    {events.map((event) => (
                        <div key={event.id}>
                            <strong>{event.summary || "No title"}</strong>
                            <br />
                            {event.start.dateTime
                                ? new Date(event.start.dateTime).toLocaleString()
                                : event.start.date}
                            <br />
                            <br />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
