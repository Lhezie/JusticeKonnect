import { create } from "zustand";

const UseClientDashboardProvider = create((set) => ({
  caseOverviewData:
    [
    { label: "Submitted Cases", count: 10, active: true },
    { label: "Cases Under Review", count: 5, active: false },
    { label: "Approved Cases", count: 4, active: false },
  ],
}));

export default UseClientDashboardProvider;
