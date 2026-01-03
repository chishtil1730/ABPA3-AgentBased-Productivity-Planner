import React from "react";
import CustomCursor from "./testing-stuff/CustomCursor";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {CalendarProvider} from "./calender-components/CalendarContext";
import FlowCanvas from "./flowchart_components/FlowCanvas";
import CustomKanban from "./kanban_components/CustomKanban";
import UpcomingPanel from "./calender-components/UpcomingPanel";
import TaskTracker from "./calender-components/TaskTracker";
import KanbanReveal from "./testing-stuff/KanbanReveal";
import Layout from "./layouts/Layout";
import FlowCanvasContainer from "./flowchart_components/FlowCanvasContainer";
import UpcomingPanelContainer from "./calender-components/UpcomingPanelContainer";
import TaskTrackerContainer from "./calender-components/TaskTrackerContianer";
import KanbanWidget from "./kanban_components/KanbanWidget";
import VoiceOrb from "./voice-assistant/VoiceOrb";
import IntegratedApp from "./voice-assistant/IntegratedApp";
import IntegratedContainer from "./voice-assistant/IntegratedContainer";
import TimeWidget from "./calender-components/TimeWidget";
import GradientBlinds from "./assets/backgrounds/GradientBlinds";
import GradientBg from "./assets/backgrounds/LayoutBackground";
import LayoutBackground from "./assets/backgrounds/LayoutBackground";
import TimeWidgetContainer from "./calender-components/TimeWidgetContainer";
import SwipeableContainer from "./calender-components/SwipeableContainer";

function App() {
    return (
        <div>
            <GoogleOAuthProvider clientId={"891091309825-9fehvb43esm2ne0c41p4e7p3fue7no7l.apps.googleusercontent.com"}>
                <CustomCursor />
                <CalendarProvider>
                    <KanbanReveal/>
                </CalendarProvider>
            </GoogleOAuthProvider>
        </div>
    );
}

export default App;