import React from "react";
import ClientLayout from "../components/clientLayout";
import { IoIosArrowDropleft } from "react-icons/io";

const CreateNewCase = () => {
  return (
    <div>
      <ClientLayout>
        <div className="pt-6">
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg">
              <IoIosArrowDropleft />
            </div>
            <div>Submit a New Case</div>
          </div>
        </div>
      </ClientLayout>
    </div>
  );
};

export default CreateNewCase;
