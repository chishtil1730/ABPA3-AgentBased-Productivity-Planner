import React, { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { gapi } from "gapi-script";

const API_KEY = process.env.API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export default function Calendar() {
    const [events, setEvents] = useState([]);
    const [token, setToken] = useState(null);

    // Load GAPI
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

    // When token changes → load events
    useEffect(() => {
        if (token) {
            gapi.client.setToken({ access_token: token });
            loadEvents();
        }
    }, [token]);

    const login = useGoogleLogin({
        scope: SCOPES,
        onSuccess: (tokenResponse) => {
            console.log("Logged in:", tokenResponse);
            setToken(tokenResponse.access_token);
        },
        onError: (error) => {
            console.error("Login failed", error);
        },
    });

    const loadEvents = async () => {
        const res = await gapi.client.calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            singleEvents: true,
            orderBy: "startTime",
        });

        setEvents(res.result.items || []);
    };

    return (
        <div>
            {!token ? (
                <button onClick={() => login()}>Sign in with Google</button>
            ) : (
                <div>
                    <h2>Your Events</h2>
                    {events.map((event) => (
                        <div key={event.id}>
                            <strong>{event.summary}</strong>
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
