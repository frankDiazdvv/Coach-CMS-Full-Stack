import ClientNutritionDashboard from "@/app/components/client-components/ClientNutritionDashboard";
import TopClientMobileTabs from "@/app/components/client-components/TopClientMobileTabs";
import BottomClientMenu from "@/app/components/client-components/BottomClientMenu";

export default function ClientNutritionDashboardPage(){
    return(
        <>
            <TopClientMobileTabs/>
            <ClientNutritionDashboard/>
            <BottomClientMenu/>
        </>
    );
}