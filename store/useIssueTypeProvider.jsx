import { create } from "zustand";

const useIssueTypeProvider = create((set) => ({
  issueTypes: [
    { label: "Battery", value: "battery" },
    { label: "Property Theft", value: "property_theft" },
    { label: "Human Rights Violation", value: "human_rights_violation" },

    { label: "Others", value: "others" },
  ],
}));

export default useIssueTypeProvider;
