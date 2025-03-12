import React from "react";
import { Button } from "../components/clientComponent";
import {useRouter, usePathname} from "next/navigation"

const QuickActions = () => {
    const router = useRouter();
    const pathname = usePathname();
  return (
    <div className="pt-6">
      <div className="text-md md:text-lg font-semibold ">Quick Actions</div>
      <div className="pt-6 grid grid-cols-2 gap-4">
        <Button onClick={()=> router.push("/createNewCase") } className={`bg-blue-400 text-white ` }>Submit a New Case</Button>
        <Button onClick={()=> router.push('/scheduleAppointment')} className="bg-blue-400 text-white">Schedule Appointment</Button>
              <Button onClick={()=>router.push("/messaging") } className="bg-blue-400 text-white" >Send Message</Button>
              <Button onClick={ ()=> router.push("/call")} className="bg-blue-400 text-white" >Make a Call</Button>
      </div>
    </div>
  );
};

export default QuickActions;
