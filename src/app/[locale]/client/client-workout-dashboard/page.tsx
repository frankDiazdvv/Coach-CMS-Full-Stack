import ClientWorkoutDashboard from "@/app/components/client-components/ClientWorkoutDashboard";
import TopClientMobileTabs from "@/app/components/client-components/TopClientMobileTabs";
import BottomClientMenu from "@/app/components/client-components/BottomClientMenu";

export default function ClientWorkoutDashboardPage(){

    return(
        <>
            <TopClientMobileTabs/>
            <ClientWorkoutDashboard/>
            <BottomClientMenu/>
        </>
        
    );
}