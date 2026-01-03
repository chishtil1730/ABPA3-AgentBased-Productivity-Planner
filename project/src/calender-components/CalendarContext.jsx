import React, { createContext, useContext, useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { gapi } from "gapi-script";
import "./SignInButton.css"

const API_KEY = process.env.API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// Create Context
const CalendarContext = createContext(null);

// Provider Component
export function CalendarProvider({ children }) {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gapiReady, setGapiReady] = useState(false);

    /* -------------------- Load GAPI -------------------- */
    useEffect(() => {
        gapi.load("client", async () => {
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [
                    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                ],
            });
            setGapiReady(true);
            setIsLoading(false);
        });
    }, []);

    /* -------------------- Silent Login -------------------- */
    const login = useGoogleLogin({
        scope: SCOPES,
        onSuccess: (tokenResponse) => {
            const accessToken = tokenResponse.access_token;
            setToken(accessToken);
            // Save to localStorage
            localStorage.setItem('google_calendar_token', accessToken);
            // Save expiry time (tokens typically expire in 1 hour)
            const expiryTime = Date.now() + (tokenResponse.expires_in * 1000);
            localStorage.setItem('google_calendar_token_expiry', expiryTime.toString());
        },
        onError: (error) => {
            console.error("Login failed", error);
            // Clear any stale tokens
            localStorage.removeItem('google_calendar_token');
            localStorage.removeItem('google_calendar_token_expiry');
        },
    });

    // Check token validity and load from localStorage when GAPI is ready
    useEffect(() => {
        if (gapiReady) {
            const savedToken = localStorage.getItem('google_calendar_token');
            const expiryTime = localStorage.getItem('google_calendar_token_expiry');

            if (savedToken && expiryTime) {
                // Check if token is expired
                if (Date.now() < parseInt(expiryTime)) {
                    // Token is still valid, use it
                    setToken(savedToken);
                    gapi.client.setToken({ access_token: savedToken });
                } else {
                    // Token expired, clear it and try silent login
                    localStorage.removeItem('google_calendar_token');
                    localStorage.removeItem('google_calendar_token_expiry');
                    login({ prompt: "none" });
                }
            } else {
                // No saved token, try silent login
                login({ prompt: "none" });
            }
        }
    }, [gapiReady]);

    /* -------------------- Set token in GAPI when token changes -------------------- */
    useEffect(() => {
        if (token && gapiReady) {
            gapi.client.setToken({ access_token: token });
        }
    }, [token, gapiReady]);

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

    /* -------------------- Load Events Function -------------------- */
    const getEvents = async (type = "week") => {
        if (!token) {
            throw new Error("Not authenticated");
        }

        if (!gapiReady) {
            throw new Error("Google API not ready");
        }

        const { timeMin, timeMax } = getTimeRange(type);

        try {
            const res = await gapi.client.calendar.events.list({
                calendarId: "primary",
                timeMin,
                timeMax,
                singleEvents: true,
                orderBy: "startTime",
                maxResults: 50,
            });

            return res.result.items || [];
        } catch (error) {
            console.error("Failed to fetch events:", error);
            // If token is invalid, clear it
            if (error.status === 401) {
                localStorage.removeItem('google_calendar_token');
                localStorage.removeItem('google_calendar_token_expiry');
                setToken(null);
            }
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        if (gapiReady && gapi.client) {
            gapi.client.setToken(null);
        }
        // Clear from localStorage
        localStorage.removeItem('google_calendar_token');
        localStorage.removeItem('google_calendar_token_expiry');
    };

    const value = {
        token,
        isAuthenticated: !!token,
        login,
        logout,
        getEvents,
        isLoading,
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
}

// Custom Hook
export function useCalendar() {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error("useCalendar must be used within CalendarProvider");
    }
    return context;
}

// Reusable Sign In Button Component
export function SignInButton({ children }) {
    const { login, isAuthenticated, isLoading } = useCalendar();

    if (isLoading) {
        return <button disabled className={"LoadingButton"}>Loading...</button>;
    }

    if (isAuthenticated) {
        return null; // Don't show button if already signed in
    }

    return (
        <button onClick={() => login()} className={"SignInButton"}>
            {children || "Sign in with Google"}
        </button>
    );
}

// Render Props Component for flexible event usage
export function CalendarData({ range = "week", children, autoRefresh = null }) {
    const { isAuthenticated, getEvents } = useCalendar();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const eventList = await getEvents(range);
            setEvents(eventList);
        } catch (error) {
            console.error("Failed to load events", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadEvents();
        }
    }, [isAuthenticated, range]);

    // Auto-refresh interval
    useEffect(() => {
        if (isAuthenticated && autoRefresh && autoRefresh > 0) {
            const interval = setInterval(() => {
                loadEvents();
            }, autoRefresh);

            return () => clearInterval(interval);
        }
    }, [isAuthenticated, autoRefresh, range]);

    if (!isAuthenticated) {
        return <SignInButton />;
    }

    return children({ events, loading, refresh: loadEvents });
}