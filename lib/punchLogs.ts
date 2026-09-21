export interface PunchLogItem {
  id: string;
  empId: string;
  type: string;
  timestamp: string;
  duration: string;
  status: string;
  overDuration?: string | null;
}

export type PunchActionType = 
  | 'Shift Start'
  | 'Break 1 Start'
  | 'Break 1 End'
  | 'Start Lunch'
  | 'End Lunch'
  | 'Break 2 Start'
  | 'Break 2 End'
  | 'Shift End';

export interface ShiftMilestoneItem {
  id: string;
  type: 'punch_in' | 'break_1' | 'lunch' | 'break_2' | 'punch_out';
  label: string;
  timeRange: string;
  duration?: string;
  status: 'completed' | 'active' | 'upcoming';
  iconName: 'LogIn' | 'Coffee' | 'Utensils' | 'LogOut';
  color: string;
  notes?: string;
}

export interface PunchAuditEntry {
  id: string;
  action: string;
  time: string;
  duration: string;
  category: string;
  verifiedBy: string;
  status?: string;
}

export interface ShiftPunchesState {
  hasShiftStart: boolean;
  hasBreak1Start: boolean;
  hasBreak1End: boolean;
  hasLunchStart: boolean;
  hasLunchEnd: boolean;
  hasBreak2Start: boolean;
  hasBreak2End: boolean;
  hasShiftEnd: boolean;
}

export const INITIAL_PUNCH_LOGS: PunchLogItem[] = [
  {
    "id": "d634ff4c-4b56-4371-9136-3182add987db",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/17/2026 1:57:09",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "df72b267-b965-414c-9c9d-697a6e7fd777",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "8/25/2026 22:50:28",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "667ff79a-9335-4ee5-a235-ec7fc642dd42",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "8/25/2026 22:52:47",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d69a8018-d98a-468e-87e0-1c3a1a27e035",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "8/25/2026 22:52:54",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "36f0a749-5cc5-4627-b567-c7530f97c61e",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "8/25/2026 22:52:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1408536f-b8ab-4de1-a793-f6144c625161",
    "empId": "1954",
    "type": "Start Break",
    "timestamp": "8/25/2026 23:00:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "859cdbf6-dd54-4b52-ad96-1f855e4c16b5",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "8/25/2026 23:02:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "19951247-a7e5-4e91-b93d-d69ad333ed97",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "8/25/2026 23:04:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a13023a6-bea2-4316-98ad-bc13b2bd4fd2",
    "empId": "2298",
    "type": "Start Break",
    "timestamp": "8/25/2026 23:08:19",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6d69771b-4701-4402-a538-953ebbd80dfe",
    "empId": "2298",
    "type": "End Break",
    "timestamp": "8/25/2026 23:08:30",
    "duration": "0.19",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f35dcd85-0be6-4451-b3ee-4567ce983a1b",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "8/25/2026 23:11:00",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4b14ff5b-7c27-4009-abf5-9a4d77cbc5b2",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "8/25/2026 23:11:52",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b530600d-fbfb-41fa-82bf-5b2b9ed02a49",
    "empId": "1954",
    "type": "End Break",
    "timestamp": "8/25/2026 23:13:05",
    "duration": "12.61",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "00f07cf0-73a9-43de-9c66-ad48e0d08f9c",
    "empId": "1820",
    "type": "Start Break",
    "timestamp": "8/25/2026 23:34:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "407d0150-d71d-4763-828e-d128f395ca8c",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "8/25/2026 23:34:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ea668312-e69b-468c-87f3-b1357e781a6f",
    "empId": "1820",
    "type": "End Break",
    "timestamp": "8/25/2026 23:46:09",
    "duration": "11.76",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4de5daba-fb2f-4dfe-b8a7-b29994a05d9b",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "8/25/2026 23:46:21",
    "duration": "34.48",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "86875672-0d8b-4f90-a8cf-b954e42f4729",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "8/25/2026 23:48:43",
    "duration": "14.23",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6ca543b0-fbc9-437b-9286-046d5db38fc7",
    "empId": "1954",
    "type": "Start Lunch",
    "timestamp": "8/26/2026 2:16:03",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6d88ad89-7655-4201-98a2-c151fc7ed697",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "8/26/2026 2:32:18",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9337ad8b-70d9-4599-8a39-1f779275b0f7",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "8/26/2026 2:32:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1590f2d9-7943-4fcf-a3a1-348a951ba419",
    "empId": "1954",
    "type": "End Lunch",
    "timestamp": "8/26/2026 3:13:07",
    "duration": "57.05",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f6e95902-8713-48e0-86f5-cf777a120ece",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "8/26/2026 3:14:28",
    "duration": "41.97",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e41fa175-a8d2-4205-97b0-4fac6b04eaa9",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "8/26/2026 3:33:26",
    "duration": "61.13",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f65a1a29-176b-468c-9d8c-022e9856da8d",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "8/26/2026 4:50:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "225753e8-cedf-4210-8fe2-af1a07d61663",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "8/26/2026 5:03:25",
    "duration": "12.71",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d285c323-cbd6-451b-bdcf-bfb08a234710",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "8/26/2026 6:05:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "30197564-016f-40b6-8aac-aba7932663e9",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "8/26/2026 6:16:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "112f7265-33ac-411e-be11-97abecad75f9",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "8/26/2026 6:16:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0a6b1a9f-b67d-4c18-b82a-604ce6029d73",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "8/26/2026 16:38:34",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6e9efaf2-5b1e-4378-935a-faf480dab898",
    "empId": "2385",
    "type": "Start Break",
    "timestamp": "8/26/2026 19:54:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ecec07e6-8f92-43b6-b673-8f10e3d2efe5",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "8/26/2026 19:57:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9f5b9663-25d0-4d82-a71f-3761dde177d4",
    "empId": "2385",
    "type": "End Break",
    "timestamp": "8/26/2026 20:07:33",
    "duration": "13.01",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "24e897b0-7f55-4bc2-81c4-09ae0b88da24",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "8/26/2026 20:33:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e07581b9-a370-4120-9878-7181fc65f49f",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "8/26/2026 20:39:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ffad2339-0717-4239-8e8f-03f5973bc7fc",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "8/26/2026 20:39:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "34ee57c6-b015-4896-affb-f38f82842f5b",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "8/26/2026 20:43:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3a84ea91-06f7-4792-877d-ef75d6deb887",
    "empId": "836",
    "type": "Shift Start",
    "timestamp": "8/26/2026 20:49:00",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "08e94bec-b38a-4342-aa4a-bfde3defa996",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "8/26/2026 20:59:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6c88cd8d-513c-4a03-8853-70b05bad971d",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "8/26/2026 20:59:28",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d0613717-cfb6-44ac-b414-49bf25564fef",
    "empId": "2298",
    "type": "Start Break",
    "timestamp": "8/26/2026 22:18:38",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b918ede9-70d9-4115-a5c6-8ec15ad6f3e7",
    "empId": "2298",
    "type": "End Break",
    "timestamp": "8/26/2026 22:30:14",
    "duration": "11.59",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "88232de9-2b5b-4559-a454-d9098478b1d5",
    "empId": "2610",
    "type": "Start Break",
    "timestamp": "8/26/2026 22:31:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c10e51ad-04e7-4875-a4c0-5049a5988475",
    "empId": "2610",
    "type": "Start Break",
    "timestamp": "8/26/2026 22:31:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f3da4471-f2e9-4e41-8f0d-98499b657702",
    "empId": "2610",
    "type": "End Break",
    "timestamp": "8/26/2026 22:37:37",
    "duration": "6.18",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "48d7f73b-a593-4f33-a86b-32ad28c17a3d",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "8/26/2026 22:54:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "30b1d7ef-4c81-4b1e-9f92-b5698e339a2f",
    "empId": "1954",
    "type": "Start Break",
    "timestamp": "8/26/2026 23:00:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f5a05cea-7730-48e5-918c-7f34d47e4cca",
    "empId": "1954",
    "type": "End Break",
    "timestamp": "8/26/2026 23:13:08",
    "duration": "13.01",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2ca7e0cb-596a-4fda-bdb2-bef2b5db1a08",
    "empId": "1820",
    "type": "Start Break",
    "timestamp": "8/26/2026 23:25:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2963287f-d46e-4eb4-8f5f-4e2b258e2732",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "8/26/2026 23:38:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "438dc72d-5463-4011-a6f3-0bff2348e4d0",
    "empId": "836",
    "type": "Start Break",
    "timestamp": "8/26/2026 23:46:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "22cc523d-056f-437b-9b13-459cbbdbacd8",
    "empId": "1006",
    "type": "Start Break",
    "timestamp": "8/26/2026 23:47:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6bbe395c-ef51-4874-9c7e-7fa172e95a7e",
    "empId": "1006",
    "type": "Start Break",
    "timestamp": "8/26/2026 23:47:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8c403fc2-4e9d-43c5-8e2d-d0b014a90c67",
    "empId": "1006",
    "type": "End Break",
    "timestamp": "8/26/2026 23:49:16",
    "duration": "2.14",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4daca71a-4f88-4eb7-87a1-025408112278",
    "empId": "836",
    "type": "End Break",
    "timestamp": "8/26/2026 23:52:01",
    "duration": "5.96",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9b305ac8-f7f4-4bec-a661-2885c40ad895",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "8/26/2026 23:55:58",
    "duration": "17.57",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a83755e8-d261-43f5-97a6-d9c6b545df29",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "8/26/2026 23:58:23",
    "duration": "63.64",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "50c7a682-d630-4a13-b3ac-da26b1dc8380",
    "empId": "2298",
    "type": "Start Lunch",
    "timestamp": "8/27/2026 0:25:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "50eb83d0-96ee-4742-80f6-b6455bece964",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "8/27/2026 0:43:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1ce1b662-b5cb-4508-81f1-1ef9e8081b80",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "8/27/2026 0:43:48",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4a8562a2-ecec-4781-9c32-c25b5df21c79",
    "empId": "2298",
    "type": "End Lunch",
    "timestamp": "8/27/2026 0:47:10",
    "duration": "22.14",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5352bb78-bc1d-4732-b18e-725b79af3100",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "8/27/2026 2:06:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ebef13ef-533f-4d8e-b475-be1b45bfffc1",
    "empId": "1820",
    "type": "End Break",
    "timestamp": "8/27/2026 2:08:28",
    "duration": "163.03",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "77e748ea-f62a-4a46-9ef9-737b971e5299",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "8/27/2026 2:08:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b3c0ace4-8042-4166-90cf-dea4fe1aa2af",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "8/27/2026 2:08:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "775fd976-763a-4b5a-8412-ae7fb942bda4",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "8/27/2026 2:10:58",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "207b3818-a2fb-4675-a975-f83f9568c74e",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "8/27/2026 2:21:39",
    "duration": "97.85",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2ed51ab4-1855-4878-89cb-5ea42491b30d",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "8/27/2026 2:24:56",
    "duration": "13.97",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c2f08b5e-ffd6-42df-878b-ab177e5a4a7d",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "8/27/2026 3:04:46",
    "duration": "56.06",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "dd17a491-b740-4742-8483-7f8e88266ee1",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "8/27/2026 3:05:27",
    "duration": "59.32",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f507dabf-b453-4b04-a76a-c16acc328c35",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "8/27/2026 3:42:49",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "98d8bcf6-257d-41ff-ba93-3b7aa3d0bde1",
    "empId": "1006",
    "type": "Start Break",
    "timestamp": "8/27/2026 4:03:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "658ed1e7-ef36-4dc0-915f-5fbf15fd7da8",
    "empId": "1006",
    "type": "End Break",
    "timestamp": "8/27/2026 4:10:42",
    "duration": "7.17",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "70da01c7-b1ad-49ee-922e-4a54c665250f",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "8/27/2026 4:31:00",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6257ff2e-4ed5-4803-9d2b-3466a23836e4",
    "empId": "836",
    "type": "Start Break",
    "timestamp": "8/27/2026 4:36:26",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "adc87c81-e7c1-4121-a256-fe2d162daecf",
    "empId": "836",
    "type": "End Break",
    "timestamp": "8/27/2026 4:44:01",
    "duration": "7.58",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "468cf059-8440-4083-9cf0-221265598130",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "8/27/2026 4:47:30",
    "duration": "16.51",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4b0d53fb-9b96-4b8c-8eb6-6a30f15e31c4",
    "empId": "1820",
    "type": "Start Break",
    "timestamp": "8/27/2026 5:00:41",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a2d3b254-670e-42db-b212-3b1d2073131b",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "8/27/2026 5:54:34",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f536f19a-b21e-4a82-909d-db1e249959c4",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "8/27/2026 6:01:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "42f6a4db-d1c9-4847-89b0-f76cfb3204b1",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "8/27/2026 6:05:10",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fc8c396d-f65b-44e9-ae98-3ada311a5274",
    "empId": "1820",
    "type": "End Break",
    "timestamp": "8/27/2026 6:05:55",
    "duration": "65.23",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "88fbe3d8-4ab0-4ec6-8963-1d052172aef5",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "8/27/2026 6:06:00",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a2bbc162-e23b-42e1-b12f-f10d1caf2fbc",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "8/27/2026 16:16:13",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "978cae33-2148-46e1-a820-214e7a4ae76a",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "8/27/2026 19:58:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "572e3bde-f178-444a-b74e-9f4fe8465010",
    "empId": "2298",
    "type": "Start Break",
    "timestamp": "8/27/2026 19:58:39",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8c0cac69-e6f0-40ae-8d8e-871edc0bab97",
    "empId": "2298",
    "type": "End Break",
    "timestamp": "8/27/2026 19:58:50",
    "duration": "0.18",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e13e67e4-2051-45a4-8352-397b84faaff4",
    "empId": "2298",
    "type": "Start Break",
    "timestamp": "8/27/2026 19:58:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9afbb0b0-0109-468d-93ac-92cf46179ea2",
    "empId": "2298",
    "type": "End Break",
    "timestamp": "8/27/2026 19:58:57",
    "duration": "0.07",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8efa4f74-fbd8-47b0-a712-fc25c17a7b18",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "8/27/2026 20:00:23",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "b51975a5-791d-42d1-9a30-2749e1c0c0ab",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "8/27/2026 20:00:43",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "f65e1b42-ac26-422d-a42f-b94b0238b499",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "8/27/2026 20:30:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "11e3d336-bc19-4c69-aafa-29e4d7da9d29",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "8/27/2026 20:41:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "636cee01-f475-4d7f-9c44-e250b390906a",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "8/27/2026 20:48:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "62b84d98-7538-4ce8-87d2-626474a8e296",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "8/27/2026 20:50:36",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "062ccc5c-51cf-4bf1-a399-1c4efd3f20c9",
    "empId": "2385",
    "type": "Start Break",
    "timestamp": "8/27/2026 20:52:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "99023eb2-5e20-4c9a-a610-73fe975c216b",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "8/27/2026 20:54:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3a2d58fa-f90a-4558-9cff-28cc0dfe9266",
    "empId": "2385",
    "type": "End Break",
    "timestamp": "8/27/2026 20:59:56",
    "duration": "7.01",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "49db55ca-f8f3-47a8-abbe-38c9045faf48",
    "empId": "836",
    "type": "Shift Start",
    "timestamp": "8/27/2026 21:00:30",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "3ac0f14d-0750-4d58-aadc-56cc31fef1d1",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "8/27/2026 21:06:06",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "a4cef258-5ac0-4764-9142-af02045903f2",
    "empId": "1006",
    "type": "Start Break",
    "timestamp": "8/27/2026 23:04:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8fb4eec3-e62c-4dce-9340-7ad95f07b252",
    "empId": "1006",
    "type": "End Break",
    "timestamp": "8/27/2026 23:07:04",
    "duration": "2.35",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a7c2c6a1-4447-4a6e-9e6c-68158435b9cc",
    "empId": "1954",
    "type": "Start Break",
    "timestamp": "8/27/2026 23:15:05",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "78439c70-f57a-436a-8f92-17bebe7f2dd7",
    "empId": "836",
    "type": "Start Break",
    "timestamp": "8/27/2026 23:30:05",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bf2da9c5-c58d-4952-bb97-81c5b1f42be3",
    "empId": "1954",
    "type": "End Break",
    "timestamp": "8/27/2026 23:30:09",
    "duration": "15.08",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "453a972c-d3fe-4440-92d4-e59f1f25b9fc",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "8/27/2026 23:34:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "51afe35a-8e4c-4d5d-8fa9-7e445bb803f8",
    "empId": "836",
    "type": "End Break",
    "timestamp": "8/27/2026 23:35:56",
    "duration": "5.85",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9b230fea-fea6-4deb-8ca8-8b27558617e2",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "8/27/2026 23:48:49",
    "duration": "14.29",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4a950528-f2f8-46e8-9f90-b0089b07a592",
    "empId": "1880",
    "type": "Start Break",
    "timestamp": "8/27/2026 23:51:54",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c3896089-3ea4-4985-9449-c7fc552ec8c1",
    "empId": "1880",
    "type": "End Break",
    "timestamp": "8/27/2026 23:59:00",
    "duration": "7.1",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4edb02fa-2203-4c78-b087-6632e278c37e",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "8/28/2026 0:11:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9bd030f2-d655-4154-a332-eacb117f9ecb",
    "empId": "1820",
    "type": "Start Break",
    "timestamp": "8/28/2026 0:47:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "dae6edb3-0124-4db3-825f-236c9d48596d",
    "empId": "1820",
    "type": "End Break",
    "timestamp": "8/28/2026 0:53:02",
    "duration": "5.49",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2b52a710-9a25-4f0f-9e7a-0f9dadc69a38",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "8/28/2026 0:54:41",
    "duration": "42.92",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4ce72b96-1491-4baf-9db4-c21d2c6d3c7e",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "8/28/2026 0:54:41",
    "duration": "42.91",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ee0cd004-ca23-44cc-ab8d-266fe4d892bf",
    "empId": "1954",
    "type": "Start Lunch",
    "timestamp": "8/28/2026 1:00:13",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fd95aea5-59f6-4729-b906-8e542317a76c",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "8/28/2026 1:09:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "694ab610-6e6f-4840-9f39-5e56c18af5f3",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "8/28/2026 1:18:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "48430ce2-9bc8-4075-9388-e836efcde1b0",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "8/28/2026 1:29:46",
    "duration": "19.82",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3167b0c8-6089-4448-aa95-31c8e535a1fe",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "8/28/2026 1:42:46",
    "duration": "24.35",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ba46b5cf-fbea-4dd5-8f15-1750583c9ca6",
    "empId": "1954",
    "type": "End Lunch",
    "timestamp": "8/28/2026 1:56:27",
    "duration": "56.24",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ded5b669-4713-437d-9e84-71db7c7ea470",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "8/28/2026 2:03:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "824303fa-e720-4ac1-909f-9750350cee61",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "8/28/2026 2:09:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a2a0720d-d672-4bb3-97e2-2ad1dfc2112b",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "8/28/2026 2:33:09",
    "duration": "24.04",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b8e522fa-6294-49fa-b2b8-355bd378b398",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "8/28/2026 3:00:48",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cb7dfef3-74a7-4222-aa9d-7efdb3c5c23e",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "8/28/2026 3:06:37",
    "duration": "63.14",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cde19eae-3973-482d-bfda-f3fc55165d64",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "8/28/2026 3:24:27",
    "duration": "23.65",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ead67cf0-888a-4e8a-b6ac-ac2968db9f19",
    "empId": "946",
    "type": "Start Break",
    "timestamp": "8/28/2026 4:00:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fc85a765-3d5d-40e1-a29b-39480d15858c",
    "empId": "946",
    "type": "End Break",
    "timestamp": "8/28/2026 4:13:41",
    "duration": "13.21",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a5d333a7-333d-4d75-80c8-fcc0b1d687cf",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "8/28/2026 4:40:58",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "443aa7d7-b094-4238-97de-e4c3dc8d06e2",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "8/28/2026 4:55:47",
    "duration": "14.82",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "83531a7d-9e22-4277-976c-3be92e23f7bf",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "8/28/2026 5:09:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7827140a-f07a-4354-94b2-3c2d60c40096",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "8/28/2026 5:11:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d992696e-142e-41dc-9256-4eea893e0ce3",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "8/28/2026 5:14:54",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "28e7a7ba-effb-47d9-bdba-33e4218aa906",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "8/28/2026 6:04:06",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "c071354a-2170-4968-894f-31a4229fa8c6",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "8/28/2026 6:04:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5bf1b8b7-ad08-401a-a3af-0c9de47df2aa",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "8/28/2026 6:08:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "273776e2-c969-4484-990f-d5735f81e14e",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "8/28/2026 6:08:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8f2e2a18-0adc-4ca6-a7ac-944564c5d2ed",
    "empId": "836",
    "type": "Shift End",
    "timestamp": "8/28/2026 6:12:10",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b9c9091d-2030-4259-8f02-efb26f9951cc",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "8/28/2026 6:12:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5b779537-c4cf-4be6-8574-4d905242821b",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "8/28/2026 6:12:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e06e57d8-16c2-45b1-956a-259235ba99c8",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "8/28/2026 6:12:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2e263e0c-0eaa-4944-a575-df203b4007fd",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "8/28/2026 6:12:12",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e59f0528-cd6c-4c6e-9882-2da7f9f01aec",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "8/28/2026 20:14:43",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "fbbd30f3-119f-4b3f-8e01-46bbea8d5dfc",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "8/28/2026 20:15:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b9c83c0e-3485-45a6-a8fb-69e8be023621",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "8/28/2026 20:25:15",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "f10964cf-b07e-4537-8dd7-ac3365213a0a",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "8/28/2026 20:43:05",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c25925b2-2ebf-410b-bf5f-22d5647ca369",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "8/28/2026 20:44:36",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "402c5b41-e788-40a0-a7af-f8e62edcaff4",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "8/28/2026 20:53:38",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "078e8d23-8856-4ed8-afff-1f626e3c3aff",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "8/28/2026 20:54:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3488dc73-23c5-4dcb-a320-85c3b0a10c87",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "8/28/2026 20:58:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "98aa7229-820e-43ff-b2cf-baaef95c52a4",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "8/28/2026 21:05:32",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "e6090266-d51f-4812-981d-db32a87b1048",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "8/28/2026 22:59:20",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "5cffe19d-2262-47f3-b9c2-b3910c448d3d",
    "empId": "1954",
    "type": "Start Break",
    "timestamp": "8/28/2026 23:00:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "76ec5953-f42f-416e-bf7a-34f9f17f67db",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "8/28/2026 23:01:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "78b3e8c9-b2aa-4488-a261-ac006f6c5918",
    "empId": "1880",
    "type": "Start Break",
    "timestamp": "8/28/2026 23:04:57",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a5ac2a52-b802-48ab-8aa2-9df5f07ae370",
    "empId": "1954",
    "type": "End Break",
    "timestamp": "8/28/2026 23:07:16",
    "duration": "6.55",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "eb3cac9d-90d4-42aa-8a3a-b5afc223bcf0",
    "empId": "1880",
    "type": "End Break",
    "timestamp": "8/28/2026 23:09:42",
    "duration": "4.75",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a2e87f8e-ba9f-4549-b366-9a205c93cd7e",
    "empId": "1954",
    "type": "Start Break",
    "timestamp": "8/28/2026 23:30:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "25ca794b-3e06-47d9-9ed3-5d15620d0bd4",
    "empId": "1954",
    "type": "End Break",
    "timestamp": "8/28/2026 23:31:22",
    "duration": "0.6",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e63c592d-a681-40d0-a053-8b301d507022",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "8/28/2026 23:46:05",
    "duration": "44.15",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "506a0d16-8756-4702-94a4-cc2396a480fe",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "8/28/2026 23:46:57",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a46daa07-9dff-44a7-afcc-ddfdbfa64b7f",
    "empId": "1820",
    "type": "Start Break",
    "timestamp": "8/28/2026 23:50:58",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4e7d1a11-db61-49cf-94a3-b757f60949ed",
    "empId": "1006",
    "type": "Start Break",
    "timestamp": "8/28/2026 23:59:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f5bb5d3c-5d51-4860-aa30-eeaa809f9f6d",
    "empId": "1006",
    "type": "End Break",
    "timestamp": "8/28/2026 23:59:24",
    "duration": "0.28",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "45fed0e5-776e-4317-a137-80fe1740f88b",
    "empId": "1820",
    "type": "End Break",
    "timestamp": "8/29/2026 0:01:09",
    "duration": "10.18",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "db3a9d2c-835d-4c6e-810d-e76929113e10",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "8/29/2026 0:01:23",
    "duration": "14.43",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "25cac7b6-26c5-41cf-8334-5e3f2c608151",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "8/29/2026 0:11:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ed06a436-473d-4413-ab62-7bfc29096100",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "8/29/2026 0:19:49",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "f4634c3b-9b50-46da-85b1-eb069d2d2990",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "8/29/2026 1:00:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d7111e38-c210-4261-a697-221e789c3b64",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "8/29/2026 1:01:48",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3dd18d6c-25e6-4f5e-9cb3-47ceb9202c05",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "8/29/2026 1:14:06",
    "duration": "62.7",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2633c6e7-fb39-4e86-97d9-874f46e371d9",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "8/29/2026 1:31:57",
    "duration": "30.15",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c62c6520-0f3f-497a-b9e2-f3da6a3d4dd2",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "8/29/2026 1:47:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d10f58e3-4ed1-43c3-aa8b-21d41e8addad",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "8/29/2026 1:52:56",
    "duration": "52.02",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e8aefff8-cc62-4d2d-b78a-797a80a83e4b",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "8/29/2026 2:03:17",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6f258c05-79d8-4851-b209-24acc058e306",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "8/29/2026 2:10:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "aa2912f6-a4b9-4b2b-8a9d-f0b448c3f930",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "8/29/2026 2:28:52",
    "duration": "41.25",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3cdf4973-cb6f-4101-83de-d90a6ddef515",
    "empId": "1035",
    "type": "Start Break",
    "timestamp": "8/29/2026 2:35:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ea8b5ee8-58d4-420f-9376-25afcafb5683",
    "empId": "1035",
    "type": "End Break",
    "timestamp": "8/29/2026 2:46:16",
    "duration": "10.28",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "651611f9-6473-496a-858c-7321c988aed0",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "8/29/2026 3:03:38",
    "duration": "52.92",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c85fd380-7814-4050-8a41-fff1e7a4145c",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "8/29/2026 3:03:51",
    "duration": "60.57",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "77c03aa2-daf2-4821-b5cd-73db2feaa471",
    "empId": "2298",
    "type": "Start Break",
    "timestamp": "8/29/2026 3:05:10",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2404ebc1-9281-4d98-8c2f-52d86af0de45",
    "empId": "2610",
    "type": "Start Break",
    "timestamp": "8/29/2026 3:05:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "025301eb-da8f-4ed3-9951-385b4189aaa4",
    "empId": "2298",
    "type": "End Break",
    "timestamp": "8/29/2026 3:10:41",
    "duration": "5.52",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "110e1c77-845f-4104-b174-8c1ba32e4041",
    "empId": "946",
    "type": "Start Break",
    "timestamp": "8/29/2026 4:02:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fac9ae8a-affc-4a1b-aafd-560a3ad9357f",
    "empId": "1880",
    "type": "Start Break",
    "timestamp": "8/29/2026 4:02:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "38d8ffbc-deb9-4ee7-b43a-149f764b968d",
    "empId": "1880",
    "type": "End Break",
    "timestamp": "8/29/2026 4:09:50",
    "duration": "7.22",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5cc423bf-8499-4ccf-9b21-e003b61c10a0",
    "empId": "946",
    "type": "End Break",
    "timestamp": "8/29/2026 4:10:15",
    "duration": "8.12",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a10c9441-5d19-4ec2-a947-7032a2d6348e",
    "empId": "2610",
    "type": "End Break",
    "timestamp": "8/29/2026 4:33:09",
    "duration": "87.65",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d468a7c9-2bd9-439b-8486-42915625c353",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "8/29/2026 5:05:09",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "62b1556a-ba62-4a0a-9eb2-bb23e95a5143",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "8/29/2026 5:05:22",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5505fe5d-86b3-45c9-8a4f-b56fb5d785ec",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "8/29/2026 5:28:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8510a04d-5346-445f-a32b-0069638eedbf",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "8/29/2026 5:45:54",
    "duration": "17.37",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bbcd344a-a4cc-48fc-baba-5a313767d065",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:02:34",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d578d652-beb6-4cee-9792-cd8cc02dac19",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:02:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "00038e8d-984c-451a-8c25-743dca8bd80d",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:05:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ddd6285d-d8cd-4695-98a2-949790cd79d2",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:06:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fd05c02e-cf18-493c-893f-1c7258c30173",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:08:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d11fd514-1fd5-4a04-b163-2a05dcba5869",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:08:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bc180988-47d8-46b1-a3bd-050c567a96d9",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:08:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6918fbbd-7bd7-4c15-b6c0-2dff7a803111",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:08:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7f0fb4c8-8391-451f-8fe1-ecd27941c63c",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:08:57",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e286736b-ee4b-47aa-8f1a-f7c231b953e0",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "8/29/2026 6:10:03",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4d3da955-4fb0-466a-b16a-f8faeb2e61cf",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "8/29/2026 6:19:15",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1209ce3c-d5ca-42ce-b925-cba6288fa113",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "8/29/2026 7:03:03",
    "duration": "43.8",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1358938b-97bb-4058-9980-a2b6e60d4009",
    "empId": "1035",
    "type": "Start Break",
    "timestamp": "8/29/2026 7:31:00",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6b0bdd44-87cb-4e9a-aff9-36d7e5ce7af9",
    "empId": "1035",
    "type": "End Break",
    "timestamp": "8/29/2026 7:42:24",
    "duration": "11.4",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1e1d72ae-ece3-4e43-9d5c-4f6be0c663a2",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "8/29/2026 9:01:20",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4ce49bc3-a719-4e23-a4a2-211719d22533",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "8/31/2026 17:39:55",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "d5f8bbce-622d-434b-bbe3-1412174389a1",
    "empId": "2385",
    "type": "Start Break",
    "timestamp": "8/31/2026 19:12:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6e71c014-c1c9-4d0e-8d70-50040288c1cf",
    "empId": "2385",
    "type": "End Break",
    "timestamp": "8/31/2026 19:31:13",
    "duration": "18.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e9458b35-b2da-4a49-8672-5869285ee46a",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "8/31/2026 19:58:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6a5ea598-3f3f-4563-b3dc-5209e31b7659",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "8/31/2026 20:45:02",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "67d784f5-b00f-490a-bd47-a0fdfd7ffd62",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "8/31/2026 21:27:00",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "eff8a016-abae-4e49-b1d2-e829a4010d63",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "8/31/2026 21:28:53",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "9aa6b73d-ad71-45ec-960f-63a5508bfdab",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "8/31/2026 22:07:21",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8614909d-e70e-4c6f-93d1-6646a56bd70c",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "8/31/2026 22:44:34",
    "duration": "37.22",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fd8de0f5-f8cd-4216-90ea-3cd5f9488727",
    "empId": "2610",
    "type": "Start Break",
    "timestamp": "8/31/2026 23:02:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2b3fc036-ad88-47a5-8fea-5ab12c00d279",
    "empId": "1880",
    "type": "Start Break",
    "timestamp": "8/31/2026 23:04:13",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3da68ef5-6c89-4c91-89c5-2d5f474ee610",
    "empId": "1880",
    "type": "End Break",
    "timestamp": "8/31/2026 23:10:12",
    "duration": "5.98",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2ec67b07-0697-45fc-9f1f-bd0d586d80f2",
    "empId": "2610",
    "type": "End Break",
    "timestamp": "8/31/2026 23:12:44",
    "duration": "10.18",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "446750bd-b316-4e3f-b573-5f0a9c85c65a",
    "empId": "946",
    "type": "Start Break",
    "timestamp": "8/31/2026 23:28:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bdea8263-1f01-4745-a960-d3f5f1994dd8",
    "empId": "946",
    "type": "End Break",
    "timestamp": "8/31/2026 23:42:56",
    "duration": "14.05",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "93343ac4-92c4-4b74-b010-24bdc85dcf55",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/1/2026 1:04:21",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "30f8a0b2-a771-4b3c-95f7-1287aca824a9",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/1/2026 1:15:10",
    "duration": "10.82",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8bd9701e-0a0f-43f2-b1af-01ecd40c7448",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/1/2026 1:20:26",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "036af1d8-6609-46d3-8a29-3d9b9a0f2723",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/1/2026 1:56:13",
    "duration": "35.78",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "702942a6-4ff2-4c7d-ae79-134c40b58811",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/1/2026 2:01:26",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "40104369-0fe4-4511-98cf-5946917f38fc",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/1/2026 3:11:42",
    "duration": "70.27",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bef659b2-c0a9-42c9-8811-7b28fcf7bb7c",
    "empId": "1880",
    "type": "Start Break",
    "timestamp": "9/1/2026 4:02:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ba1c0e5f-64ff-49d8-841e-cb810a0f3855",
    "empId": "1880",
    "type": "End Break",
    "timestamp": "9/1/2026 4:06:06",
    "duration": "3.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5e32b890-c1b5-4399-8f4a-39029619150b",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/1/2026 6:02:36",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6ff95bd7-6a58-4ccb-8fc5-db90c652535f",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/1/2026 6:05:12",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "363314fc-854e-4073-963e-9a8580395db3",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/1/2026 6:06:20",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6c6f3a03-dcd2-4d22-9140-4172edd5f894",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/1/2026 10:16:53",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "c6a81bae-895e-4c66-83a6-01f619e77fe7",
    "empId": "1820",
    "type": "Start Break",
    "timestamp": "9/1/2026 13:34:50",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9ac39827-80b5-4635-b144-23bfc9d308da",
    "empId": "1820",
    "type": "End Break",
    "timestamp": "9/1/2026 13:49:26",
    "duration": "14.6",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "015de57a-d52e-4c30-843a-2b1e72f37991",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/1/2026 16:43:15",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "14ad4f0a-e5aa-47f8-b321-3aa2de63376d",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/1/2026 16:43:18",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "16cebbf4-1ccf-459d-a915-1506848322f2",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/1/2026 18:33:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b146cc78-e1e6-490d-a48a-120e9c0915f8",
    "empId": "2385",
    "type": "Start Break",
    "timestamp": "9/1/2026 19:47:09",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "04f13f71-eaa5-4ee1-b19e-466907b430f8",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/1/2026 19:54:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1cfc4bd3-34cd-4d91-8242-d684dd6cc3e1",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/1/2026 19:56:56",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "4854dcb1-cb83-4ccf-b7b4-378cddce4891",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/1/2026 19:56:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "669094e3-1708-46b0-937d-71606a21e707",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/1/2026 20:13:21",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "dcef5fa1-5ba9-48b2-aa18-95f79600e125",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/1/2026 20:50:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f0ec5aa3-3c0c-48ef-943b-34f8e6491819",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "9/1/2026 21:06:42",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "13491bbe-a6e2-41b1-bde1-0ebfb8e57c01",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "9/1/2026 21:06:50",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "b371b68f-1710-4a47-9d57-07b7f5478ad4",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/1/2026 21:13:51",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "129535f8-6690-4d5c-b32e-0bfdfe674841",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/1/2026 21:17:31",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "6a3d4c4d-1aa4-4fb5-9b90-a82443121b15",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/1/2026 21:24:00",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "de465fda-f7ba-482c-a586-d49082c4d2c6",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/1/2026 21:24:54",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "81763f08-5e10-41bf-80fd-8836d6c657ac",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/1/2026 22:09:22",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "cad3a9e4-ca62-4816-b646-ca9fc6bdeaa0",
    "empId": "2610",
    "type": "Start Break",
    "timestamp": "9/1/2026 22:58:57",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e5255893-b3be-41ac-8d2c-7f519f87e3a4",
    "empId": "1880",
    "type": "Start Break",
    "timestamp": "9/1/2026 23:05:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9d64edc1-4bb5-4ec6-84ea-99e9a197b58f",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "9/1/2026 23:06:28",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "85156174-56fa-4c92-ab97-00dfaccbe0e2",
    "empId": "2610",
    "type": "End Break",
    "timestamp": "9/1/2026 23:08:02",
    "duration": "9.08",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ea7efd91-e61f-4df4-bacb-17cd9785b014",
    "empId": "1880",
    "type": "End Break",
    "timestamp": "9/1/2026 23:18:25",
    "duration": "12.65",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9fa514ae-7423-4ab7-9c92-776765a0d8b5",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "9/1/2026 23:21:21",
    "duration": "14.88",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5d225c57-8e65-46c9-ba8e-20e3353dbc61",
    "empId": "2385",
    "type": "End Break",
    "timestamp": "9/1/2026 23:21:31",
    "duration": "214.37",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "81332f61-c838-44e4-af44-d6438c8b62bd",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/1/2026 23:21:35",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "010ceaaa-49e3-48c9-8eed-0d38d69ca2d3",
    "empId": "1597",
    "type": "Start Break",
    "timestamp": "9/1/2026 23:31:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1dea5ab0-ab69-4b1d-bd20-6059a4dfd4ba",
    "empId": "1597",
    "type": "End Break",
    "timestamp": "9/1/2026 23:46:22",
    "duration": "14.43",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7e04a268-a298-4019-ba8e-1943ce677dc6",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/2/2026 0:12:25",
    "duration": "50.83",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bcd2cf72-0f2b-44cd-bce1-fa89b5d9c62a",
    "empId": "1035",
    "type": "Start Break",
    "timestamp": "9/2/2026 0:22:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "05f9cdcd-7aa0-4ec1-9a32-82bfa0cb7e56",
    "empId": "1035",
    "type": "End Break",
    "timestamp": "9/2/2026 0:34:52",
    "duration": "11.93",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4986f882-8c28-4295-9228-268f9b28a141",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/2/2026 1:04:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b84ed987-a2c5-441b-a8b9-e0edb9bce43a",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/2/2026 1:23:19",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "408718ba-d1e5-4997-b8be-889388484372",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/2/2026 1:24:41",
    "duration": "20.15",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "763f5a22-df61-47ee-914f-1451fcadec53",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/2/2026 1:34:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "693cb23d-de18-4708-aef8-076d29cb83a0",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/2/2026 2:03:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "dbd85336-2189-40bf-a3df-0489d542db7a",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/2/2026 2:05:44",
    "duration": "42.42",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "583e187d-8404-448e-9914-01470d305911",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "9/2/2026 2:06:24",
    "duration": "31.85",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6998c3b3-7ae0-4d4b-a8d4-a6284c73b5e6",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/2/2026 3:02:07",
    "duration": "58.67",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b7fd4201-0f1d-4da8-bbec-31591294f211",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/2/2026 3:26:58",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e5311b2c-7910-4a09-a801-5b3ed00af143",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/2/2026 4:00:57",
    "duration": "33.98",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "09e8694b-adb5-4520-946f-05de39e7879c",
    "empId": "2610",
    "type": "Start Break",
    "timestamp": "9/2/2026 4:01:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ab4ceec4-8f7b-4299-b68b-c3e783622933",
    "empId": "1880",
    "type": "Start Break",
    "timestamp": "9/2/2026 4:02:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4e460e63-b987-409b-8b11-7bc74572167c",
    "empId": "946",
    "type": "Start Break",
    "timestamp": "9/2/2026 4:04:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4ba93f52-127d-4b15-8e6b-6948fd349397",
    "empId": "1880",
    "type": "End Break",
    "timestamp": "9/2/2026 4:12:29",
    "duration": "9.57",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "94b39706-4a40-4dbc-96ed-325b1362c6dc",
    "empId": "2610",
    "type": "End Break",
    "timestamp": "9/2/2026 4:15:41",
    "duration": "14.27",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e6198297-d73b-44d9-a464-7d2bf944f477",
    "empId": "946",
    "type": "End Break",
    "timestamp": "9/2/2026 4:21:26",
    "duration": "16.82",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "70626650-e15d-46c5-9b0b-585071094737",
    "empId": "1772",
    "type": "Start Break",
    "timestamp": "9/2/2026 4:30:21",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "868e114b-ecc6-4e1c-b09a-8d5a3d463ff3",
    "empId": "1772",
    "type": "End Break",
    "timestamp": "9/2/2026 4:45:35",
    "duration": "15.23",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3e799a77-dc89-486a-ba0f-ff7de5ffe7ac",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/2/2026 5:04:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "59b4597c-1c5b-4491-9267-c3236ceeae71",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/2/2026 5:07:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2f17a813-bb85-480c-b564-7e6355e8da04",
    "empId": "1035",
    "type": "Start Break",
    "timestamp": "9/2/2026 5:15:12",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "044dc787-84ca-4b7a-8e81-fb46c4087192",
    "empId": "1035",
    "type": "End Break",
    "timestamp": "9/2/2026 5:28:09",
    "duration": "12.95",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2de7f455-f94a-4606-a443-47199b1ab0e1",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/2/2026 6:00:52",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "88d523fa-313c-44d4-84df-09724b155efd",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/2/2026 6:03:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "86e4f9b1-408d-439c-b9e6-cab1db902827",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/2/2026 6:06:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "20856074-2649-45bc-b0ae-7ce7ac748fa4",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/2/2026 10:48:59",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "d4b543cd-314b-47f0-9541-01177728eac0",
    "empId": "1820",
    "type": "Start Break",
    "timestamp": "9/2/2026 13:12:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e8cdcf58-e43e-4432-b6ac-dd551715a24b",
    "empId": "1820",
    "type": "End Break",
    "timestamp": "9/2/2026 13:26:14",
    "duration": "13.25",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "163ead8e-1794-47dc-aeee-c8453ce6ea79",
    "empId": "1820",
    "type": "Start Break",
    "timestamp": "9/2/2026 15:26:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d91741a5-a4eb-48b5-9b3b-ca69ad4b3f7e",
    "empId": "1820",
    "type": "End Break",
    "timestamp": "9/2/2026 17:03:07",
    "duration": "96.7",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "550fb762-c31c-4388-892e-9fe2f5719efd",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/2/2026 18:19:16",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "950041e0-3135-40fe-8724-9945e27e6d19",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/2/2026 18:19:19",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "29f61f41-29dc-47ee-9665-63c54bc3ec96",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/2/2026 19:51:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6b6a68a8-ed08-4044-a66e-fc91840d29ac",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/2/2026 19:59:50",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3f745235-da3c-41ec-bbf2-ccb37cf3fa56",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/2/2026 20:05:14",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "75f465d4-4630-46bc-8b11-1138e3016724",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/2/2026 20:43:49",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "0f6da9f0-8bfa-4a8f-ada5-32b9cf1fdbdf",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/2/2026 20:43:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f86b3ebf-06d0-4d94-87fb-a20daeb247cf",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/2/2026 20:46:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "000b6eb7-e339-409b-bb65-b367bb8a554f",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/2/2026 20:50:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e8a968fa-4c00-4b94-9336-20247cc51d76",
    "empId": "2385",
    "type": "Start Break",
    "timestamp": "9/2/2026 20:52:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9ac71d11-1c1f-46c3-b378-27c7714ea2ea",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/2/2026 20:58:19",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "ca60c5f6-ff7c-4df4-8796-4139022ece02",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/2/2026 20:58:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d6145fba-afb7-44c8-97e8-5d8d8776432d",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/2/2026 20:58:44",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "df330a4c-61a5-43d5-af1a-67c3c3158f3e",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/2/2026 21:02:17",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "7fc31bdd-2baa-4cb7-8fcc-116d9a292e21",
    "empId": "2385",
    "type": "End Break",
    "timestamp": "9/2/2026 21:03:22",
    "duration": "10.52",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c79aec82-dfc8-4c50-abda-5e7c433f964e",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/2/2026 21:03:59",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "5868bfc0-1001-4a1e-ae62-9d028bcb343d",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/2/2026 21:58:16",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "80249d01-a375-4852-aa39-56632bdc4e4a",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/2/2026 22:01:05",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "4b8ea1ac-70f6-4581-8aac-c1b3aa82a662",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/2/2026 22:38:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "398b943d-44e1-4de9-8126-50c01294f89f",
    "empId": "2298",
    "type": "Break 1 Start",
    "timestamp": "9/2/2026 22:45:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8d3257a8-a336-4c29-9f2e-41badb4eb080",
    "empId": "2610",
    "type": "Break 1 Start",
    "timestamp": "9/2/2026 22:45:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "136a031c-6022-460f-8904-81dc1be1138f",
    "empId": "2610",
    "type": "Break 1 End",
    "timestamp": "9/2/2026 23:00:03",
    "duration": "14.55",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "71a3c128-9252-4585-9ea2-eaf15e5b0ae3",
    "empId": "2298",
    "type": "Break 1 End",
    "timestamp": "9/2/2026 23:03:02",
    "duration": "17.63",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0b66e145-1121-418a-a3d5-96cc5f8f4258",
    "empId": "1880",
    "type": "Break 1 Start",
    "timestamp": "9/2/2026 23:04:26",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "406319e8-7319-4e0b-bb04-9df10328c0d5",
    "empId": "1880",
    "type": "Break 1 End",
    "timestamp": "9/2/2026 23:15:04",
    "duration": "10.63",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "09188ace-e2e1-4115-b4cd-dca81708cad4",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/2/2026 23:27:54",
    "duration": "49.38",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a23b551e-3c01-4160-a1b6-f0d01beadf99",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/2/2026 23:29:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7c1dbb41-4a1c-4533-baac-329a1058ab7e",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/2/2026 23:39:42",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "337c95f5-4005-4172-8ecc-8ea49003c27f",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/2/2026 23:43:18",
    "duration": "14.28",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "57f2dd92-8171-45ae-842f-c41205a449e8",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/2/2026 23:45:17",
    "duration": "5.58",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f1df91fb-5b55-4539-8d58-e68216a34667",
    "empId": "1035",
    "type": "Start Break",
    "timestamp": "9/3/2026 0:30:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "84af9dd6-0078-4874-891f-492e1978bc1f",
    "empId": "1035",
    "type": "End Break",
    "timestamp": "9/3/2026 0:48:08",
    "duration": "17.65",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "602df05d-20e2-4904-bb5e-4d8e8c192433",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/3/2026 1:01:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7e16c968-3311-44b2-9f28-0481f53ae948",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/3/2026 1:05:40",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "01438088-f9cc-47a0-ba35-e947b46e0a13",
    "empId": "1006",
    "type": "Break 1 Start",
    "timestamp": "9/3/2026 1:08:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6c124799-74ad-4fd8-b97f-54bb464c78c1",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/3/2026 1:12:01",
    "duration": "10.88",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9f26eaa2-c1a2-4f5b-a863-e0291902adec",
    "empId": "1006",
    "type": "Break 1 End",
    "timestamp": "9/3/2026 1:13:12",
    "duration": "5.13",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "777d2b89-9d24-4723-a5dc-939afa88d91b",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/3/2026 1:20:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "69f2b582-863c-4b52-9ff1-102be1c26370",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "9/3/2026 1:23:13",
    "duration": "17.55",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e232361e-3721-49c0-baf1-ecbf8f51e40c",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/3/2026 2:02:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "41b59752-8b34-4cb6-adb6-15e0928fcfcb",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/3/2026 2:05:18",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b63d0bcf-623c-4b6f-a0cf-0b535359d8db",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/3/2026 2:10:31",
    "duration": "49.75",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0fc13f02-3bc6-47be-8586-4e5eaa9291a4",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/3/2026 2:21:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a362bc53-0497-4daf-a7e2-7a7dad0845b5",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/3/2026 2:36:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9dcaeaf7-f623-4081-a66c-3d6a44bf9daa",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/3/2026 3:01:24",
    "duration": "56.1",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c0b57c4a-d9b8-49a6-9665-855895f4db96",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/3/2026 3:02:21",
    "duration": "26.23",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f6bfaa7c-804f-49a1-b959-9e8a477f5026",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/3/2026 3:24:14",
    "duration": "63.22",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ebfa9c99-70bf-4cff-88aa-6c03aee16f65",
    "empId": "1772",
    "type": "Break 2 Start",
    "timestamp": "9/3/2026 3:26:13",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "86b4f41c-4d2b-466c-ab72-e665195af98d",
    "empId": "1772",
    "type": "Break 2 End",
    "timestamp": "9/3/2026 3:26:33",
    "duration": "0.33",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4163f59b-3f34-4acf-90e0-af0b5e7e0d82",
    "empId": "1880",
    "type": "Break 2 Start",
    "timestamp": "9/3/2026 4:01:13",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "416d9aee-6742-4d24-a2ed-5da32dee8dae",
    "empId": "1880",
    "type": "Break 2 End",
    "timestamp": "9/3/2026 4:14:34",
    "duration": "13.35",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ffa564dd-b87e-4741-b364-5a08b9119217",
    "empId": "946",
    "type": "Start Break",
    "timestamp": "9/3/2026 4:17:17",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b6a5e788-a511-49bb-bca3-16a04b85852c",
    "empId": "946",
    "type": "End Break",
    "timestamp": "9/3/2026 4:36:42",
    "duration": "19.42",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "82c3bf8a-3b94-43a8-a8f5-5b359e0003bf",
    "empId": "1597",
    "type": "Break 2 Start",
    "timestamp": "9/3/2026 4:42:26",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e46f9a79-e72c-42bc-b489-dc8a6199c713",
    "empId": "1597",
    "type": "Break 2 End",
    "timestamp": "9/3/2026 4:45:20",
    "duration": "2.9",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9146aa40-5209-457b-bc13-11c0a49a37be",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/3/2026 5:01:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c68ead82-673a-4997-83c2-768a32ae606b",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/3/2026 5:05:18",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "eb98c7b2-1903-4327-8963-4d645db41a8a",
    "empId": "1035",
    "type": "Start Break",
    "timestamp": "9/3/2026 5:17:39",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c158ff32-6138-4765-840d-0f87684d3812",
    "empId": "1035",
    "type": "Break 2 End",
    "timestamp": "9/3/2026 6:00:31",
    "duration": "42.87",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9ec16f01-e308-4132-8aeb-6af313a4f82c",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/3/2026 6:01:10",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "52c580f3-5b95-4571-b39b-5b3b08f09889",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "9/3/2026 6:03:09",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "79264ebf-f788-4fe8-9226-21f9422c8a34",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/3/2026 6:04:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "29f09e0d-dd09-4231-a527-319987295189",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/3/2026 6:04:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b116de86-bf37-434d-9230-ccbdd3ee7a49",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/3/2026 6:04:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2d062ad4-5168-48ad-9a12-3e9c1ac7036f",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/3/2026 6:05:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e7237305-bbd8-49db-bd0b-30650e177576",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "9/3/2026 6:20:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7fb1aa9f-e5fc-464b-a978-fe59c49786db",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/3/2026 6:23:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fe97b3e6-c47f-43ed-9736-3a35ad2eb736",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/3/2026 6:25:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e038e94b-c44d-4ec7-b470-e958e0bc9f5f",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/3/2026 7:01:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0c64b8a2-0697-47cb-a9dd-002f28c16e79",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/3/2026 10:53:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2bf1cf17-30ff-48d3-a155-32f670512438",
    "empId": "1820",
    "type": "Start Break",
    "timestamp": "9/3/2026 14:28:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "777538eb-c87e-47c3-b7d8-c2b0cb846136",
    "empId": "1820",
    "type": "End Break",
    "timestamp": "9/3/2026 14:31:14",
    "duration": "2.62",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0150e6e9-cf42-4e3f-94e6-202899c5b26f",
    "empId": "1820",
    "type": "Break 1 End",
    "timestamp": "9/3/2026 14:31:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "41079aa7-8f19-4e91-9248-1dbb7da4746e",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/3/2026 16:53:22",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "99a2b37a-1674-460b-a7ed-1dd6d15452c4",
    "empId": "1820",
    "type": "Break 2 Start",
    "timestamp": "9/3/2026 17:30:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "deb21b5c-7199-4be3-baa0-6522164de5fd",
    "empId": "1820",
    "type": "Break 2 End",
    "timestamp": "9/3/2026 17:40:40",
    "duration": "10.15",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cc39dbdf-a9a8-4744-88bc-5699b61146a0",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/3/2026 18:43:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "83de816c-c498-4c53-9ffb-9aa4ab8c4aab",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "9/3/2026 19:11:51",
    "duration": "28.83",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "caafcd2f-d98b-4df7-b387-42d635728141",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/3/2026 19:47:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f66916b0-cd80-4192-b42f-93a7d72a81c6",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/3/2026 19:56:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "768a12e4-0468-4a34-bbda-97af73100a47",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/3/2026 20:05:15",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2c4454e1-b36d-4c3c-8c7f-9a1712f40e16",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/3/2026 20:11:39",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "77b3f485-a967-46e6-a23f-4997c95dd90c",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/3/2026 20:13:50",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8f8853a1-ceee-4515-95eb-4eb9e7c2e91b",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/3/2026 20:47:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ab4258ce-b2f5-42a2-8afd-c21798e4eb2a",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/3/2026 20:58:02",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "da46a026-2c54-4dda-a29f-7a4d963102dc",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "9/3/2026 20:58:14",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b5e7815b-71e5-45fc-9a19-db213cf8c6cd",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/3/2026 21:03:17",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "9ba4d047-396b-468b-9886-1eb2e4a79637",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/3/2026 22:13:31",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "dde0b1bd-19d1-4066-9fea-8749f4ce561f",
    "empId": "2610",
    "type": "Break 1 Start",
    "timestamp": "9/3/2026 22:50:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "727cdc2c-af17-41e5-8511-b00ffa2592c8",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/3/2026 22:53:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3db93675-c247-419d-bf2b-b73b6d52923d",
    "empId": "2610",
    "type": "Break 1 End",
    "timestamp": "9/3/2026 22:58:24",
    "duration": "8.28",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a15f4b09-d815-4bc6-a0c0-0315592fb9d5",
    "empId": "1880",
    "type": "Break 1 Start",
    "timestamp": "9/3/2026 23:04:48",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f2b284a4-42a3-46ac-9f6e-6331e9b3cbce",
    "empId": "1880",
    "type": "Break 1 End",
    "timestamp": "9/3/2026 23:12:20",
    "duration": "7.53",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b1b7e8ae-7104-4617-baeb-85b7364de651",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/3/2026 23:12:59",
    "duration": "19.1",
    "status": "Overbreak",
    "overDuration": "4.1"
  },
  {
    "id": "2ac33560-bc3f-42bb-9314-b4df281e9955",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/3/2026 23:21:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "82a887c8-5c7d-44ab-8a44-667d2d57f7a5",
    "empId": "123",
    "type": "Shift Start",
    "timestamp": "9/3/2026 23:35:25",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "04f0eae9-52fc-4f72-8f8e-3f6d2f5b9632",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/3/2026 23:58:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "77fe8557-41ae-4366-91c1-2879f163c426",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/3/2026 23:59:54",
    "duration": "38.52",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a0a75cd6-27e4-4705-8f12-3cd59f71da4e",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/4/2026 0:02:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3086d12a-a4bc-4f57-b799-58e109343897",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/4/2026 0:12:57",
    "duration": "14.43",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3e5499ca-e47c-488b-ab7c-0b217cbb2de3",
    "empId": "1006",
    "type": "Break 1 Start",
    "timestamp": "9/4/2026 0:14:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3fa084e3-0bd2-47fb-b7ba-910c19e194fa",
    "empId": "1006",
    "type": "Break 1 End",
    "timestamp": "9/4/2026 0:34:13",
    "duration": "19.6",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "73dcdb9a-a0b7-4683-a37d-3a2d969f4ca0",
    "empId": "1035",
    "type": "Start Break",
    "timestamp": "9/4/2026 0:34:48",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4b9686dc-15e4-465a-b386-a586d08e1ccb",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/4/2026 0:41:23",
    "duration": "39.32",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "82e145d7-f795-4afd-be65-b14c3bc491aa",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/4/2026 1:03:54",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "81cb359c-f663-4c32-9faa-22a89a22afb6",
    "empId": "123",
    "type": "Break 1 Start",
    "timestamp": "9/4/2026 1:15:09",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "63e80c27-5116-4b2d-b705-8667d916498b",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/4/2026 1:15:11",
    "duration": "11.28",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7a93d9b4-5494-4c5d-b9e8-9f8b71745b94",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/4/2026 1:15:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c8861962-76cd-48a8-9db7-6eea21239797",
    "empId": "123",
    "type": "Break 1 End",
    "timestamp": "9/4/2026 1:27:38",
    "duration": "12.48",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "406d8bcc-c20f-4841-a9cd-60a8d5517fb7",
    "empId": "1035",
    "type": "Break 1 End",
    "timestamp": "9/4/2026 1:40:44",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f4bf139f-9212-42ec-8655-a652432af9c5",
    "empId": "123",
    "type": "Start Lunch",
    "timestamp": "9/4/2026 2:05:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "868f3e9c-c3de-43d0-8afb-1800d8e00e4f",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/4/2026 2:05:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6cb78082-1fd1-4238-a5ff-f56c4cf095dd",
    "empId": "123",
    "type": "End Lunch",
    "timestamp": "9/4/2026 2:28:13",
    "duration": "23.15",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4161e028-ae23-4d75-8826-3921d1818d9c",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/4/2026 2:39:12",
    "duration": "83.28",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "63a6a734-3aeb-46ae-99e0-1ae09a331997",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/4/2026 2:55:02",
    "duration": "49.85",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "aa13021b-7288-4f82-8f6e-fa9f3273a783",
    "empId": "2610",
    "type": "Break 2 Start",
    "timestamp": "9/4/2026 4:02:22",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7412abf7-adf8-4fa8-ab8a-ac792b8fdbb5",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/4/2026 4:05:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9d1edb87-589e-42e6-ad50-149e31c8732e",
    "empId": "1880",
    "type": "Break 2 Start",
    "timestamp": "9/4/2026 4:08:28",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6781fa74-e6fb-4164-b0cd-8d6bdac26e70",
    "empId": "1880",
    "type": "Break 2 End",
    "timestamp": "9/4/2026 4:11:12",
    "duration": "2.73",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "07ab5091-01e3-4ba1-b033-1244af0cd6b3",
    "empId": "2610",
    "type": "Break 2 End",
    "timestamp": "9/4/2026 4:16:34",
    "duration": "14.2",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c8e811de-ad80-4e22-99d3-a7f28b95f560",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/4/2026 4:55:42",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "48a33752-9eed-4289-845b-626fe4866505",
    "empId": "1597",
    "type": "Break 2 Start",
    "timestamp": "9/4/2026 4:57:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6798b662-34c3-498c-84ed-b60394e5b92d",
    "empId": "1772",
    "type": "Break 2 Start",
    "timestamp": "9/4/2026 5:01:54",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "de3e38b6-f8a5-47dc-9cc7-10fb7d42f5e2",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/4/2026 5:02:05",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f9b280f0-e88c-44db-9de0-9eb3b75d1c7a",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/4/2026 5:03:05",
    "duration": "57.82",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "12f8dbd5-02d1-4de4-baeb-961320cc10bc",
    "empId": "1597",
    "type": "Break 2 End",
    "timestamp": "9/4/2026 5:05:26",
    "duration": "7.5",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c985aaa7-3769-49a3-ba2d-7f5504b3ab8d",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/4/2026 5:09:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7e308569-fcac-45f2-b369-41b6da6cd7b2",
    "empId": "123",
    "type": "Shift End",
    "timestamp": "9/4/2026 5:13:34",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "158ba935-6167-4e92-acd4-b83439384d1f",
    "empId": "1772",
    "type": "Break 2 End",
    "timestamp": "9/4/2026 5:15:24",
    "duration": "13.5",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3d6208bb-8f65-4e6f-9271-5ea7c41475bd",
    "empId": "1035",
    "type": "Break 2 Start",
    "timestamp": "9/4/2026 6:02:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "49d62613-0b6b-497b-814c-b18e6358134e",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/4/2026 6:03:40",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "997641e8-0ef0-43a6-9bc1-b32909aa7313",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "9/4/2026 6:03:41",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "07c80eab-5dcf-4bef-a2f1-013734d96235",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/4/2026 6:04:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "882af2d8-36c9-415b-8e16-7c0afc053e75",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/4/2026 6:04:19",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bf173167-3fd4-4a72-afbd-ce2d8b5252d0",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/4/2026 6:04:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bfdf84ba-e38b-4eeb-88c8-d198e71c319b",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/4/2026 6:05:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2115111e-ba61-4853-93f2-f4af90073ba1",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/4/2026 6:06:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3dc409e5-21b5-42dd-b6f4-3767d86f0d72",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "9/4/2026 6:06:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "116fde60-0634-4241-811b-e51a1615fcb0",
    "empId": "1035",
    "type": "Break 2 End",
    "timestamp": "9/4/2026 6:13:26",
    "duration": "10.95",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e907a5a0-ae47-4450-8b9a-65034ef6f2b7",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/4/2026 6:14:09",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "efb869cc-ca9c-4674-bb66-f1dacd339dd4",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/4/2026 10:45:39",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8666b1b0-2611-4cf2-acd5-9bcbcd437046",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/4/2026 16:25:54",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cf6d7093-9f2c-4cb4-8025-bd100b8ea9ac",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/4/2026 17:00:57",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "fcc0b534-75fe-45fa-9db4-38b9072cf994",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "9/4/2026 17:23:10",
    "duration": "57.27",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5c4225dd-382f-4350-b840-016a6e21f841",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/4/2026 19:39:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3686192a-f01c-4dc2-84bd-b08e7b9f7494",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/4/2026 19:53:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "68b13748-8f3c-4a81-ba7b-2a8228b5b55e",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/4/2026 20:01:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "110ed56f-2fdb-4b0b-9192-a34fb1c86d6c",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/4/2026 20:36:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "32941d79-d129-4d3c-9d0e-bb0892cc7ab5",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/4/2026 20:37:41",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "2c11456f-905e-4143-98c2-df3cf668265a",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/4/2026 20:48:49",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "631bfe41-f290-4f0e-ae6d-d2f9589fa50f",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/4/2026 21:00:05",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "fcf13ce4-f06e-4664-9e8c-65c3e8aec38a",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/4/2026 21:00:51",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "4a29340d-a8a4-446e-901c-fee657f498e1",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/4/2026 21:07:55",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "0cd13fd9-7844-471a-9166-ff3613747ef5",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/4/2026 21:57:12",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "133cbd0b-10cf-432f-ba44-958257b26a49",
    "empId": "2610",
    "type": "Break 1 Start",
    "timestamp": "9/4/2026 22:55:38",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d678e3ca-f4c4-4a2f-922f-46b71188f3cf",
    "empId": "2610",
    "type": "Break 1 End",
    "timestamp": "9/4/2026 23:09:35",
    "duration": "13.95",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "42551037-14be-4b89-baf8-defaf7d16a5e",
    "empId": "1880",
    "type": "Break 1 Start",
    "timestamp": "9/4/2026 23:20:36",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8f092edf-f7cb-45c2-ae32-6b32bba9dc3e",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/4/2026 23:22:47",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "90553bc1-35e5-409a-a708-79d753db197a",
    "empId": "1880",
    "type": "Break 1 End",
    "timestamp": "9/4/2026 23:27:20",
    "duration": "6.73",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "428dbe64-2cdd-4dbf-bdcc-5b47d0b15063",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/4/2026 23:28:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "179a4714-38d0-4a12-9361-aef0ea2724e0",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/4/2026 23:35:31",
    "duration": "12.73",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ba20b55e-ed15-45a2-a968-1a8623da784d",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/5/2026 0:13:09",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ba5e3da9-c4da-460e-a6c0-e60a7c782c09",
    "empId": "2298",
    "type": "Start Lunch",
    "timestamp": "9/5/2026 0:13:21",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "07a5dbed-325a-49a5-842d-6181c46ba322",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/5/2026 0:13:34",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "481a73c0-cb98-4226-bc6f-375236c3044a",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/5/2026 0:14:02",
    "duration": "45.42",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7dde508e-b5c0-482f-b04f-4d7ecfc2d8fe",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/5/2026 0:21:18",
    "duration": "8.15",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ad962207-9592-4e6a-84a4-4acf6df136eb",
    "empId": "1035",
    "type": "Break 1 Start",
    "timestamp": "9/5/2026 0:38:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7cde36c2-03af-4538-bd14-87c4a328cf57",
    "empId": "1035",
    "type": "Break 1 End",
    "timestamp": "9/5/2026 0:51:06",
    "duration": "12.92",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a2a67756-0a65-4841-9224-dab065638165",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/5/2026 0:52:49",
    "duration": "39.25",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "36ae1474-1e1d-4efb-a1ea-2bbb9019e81d",
    "empId": "2298",
    "type": "End Lunch",
    "timestamp": "9/5/2026 1:02:24",
    "duration": "49.05",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7b24f1b7-9bcc-45a0-8444-f1321e979a3e",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/5/2026 1:03:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7bfe8931-d0be-48c5-bbd7-18ae0fc0c830",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/5/2026 1:09:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7fda653c-dfa4-450c-8b5d-96a351ceefc5",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/5/2026 1:11:12",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c69ef2c7-69c9-47b2-8377-8a9c77b5aff2",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "9/5/2026 1:16:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "47db293c-ddd8-44c8-bf52-c7cc8e2102a6",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "9/5/2026 1:51:44",
    "duration": "35.12",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "208b2075-6bb1-4fc8-9a6f-be2e805efdbc",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/5/2026 2:01:03",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "42493086-5045-4c36-a19d-b82e31fd50d1",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/5/2026 2:05:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "37eb0df1-b836-404a-b527-d94c8636a283",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "9/5/2026 2:07:30",
    "duration": "57.95",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "04120064-def3-4c6e-aabc-33d51ec9a90d",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/5/2026 2:18:47",
    "duration": "67.58",
    "status": "Overlunch",
    "overDuration": "7.58"
  },
  {
    "id": "a56d5067-b11f-4ddf-9694-b820d1ff6b12",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/5/2026 2:27:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6e1422df-9282-40fd-bc87-e255a6f8ff75",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/5/2026 2:56:48",
    "duration": "51.3",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "67a40d33-faf5-4e0b-9f90-ef6e34b6b027",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/5/2026 3:26:08",
    "duration": "58.87",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a644d3fe-69fc-4192-b822-f090ca745c7b",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/5/2026 4:29:06",
    "duration": "205.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5bfa501f-1108-4bc6-aa27-9dc78fe850b2",
    "empId": "1880",
    "type": "Break 2 Start",
    "timestamp": "9/5/2026 4:29:17",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "44579fd4-2edc-4308-8dab-2ea812daba85",
    "empId": "1772",
    "type": "Break 2 Start",
    "timestamp": "9/5/2026 4:33:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fecf0840-b06b-43e9-80d2-c3973f3aae25",
    "empId": "1880",
    "type": "Break 2 End",
    "timestamp": "9/5/2026 4:34:35",
    "duration": "5.3",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9fa78c17-5579-4c0e-9083-08d320c22126",
    "empId": "1772",
    "type": "Break 2 End",
    "timestamp": "9/5/2026 4:46:36",
    "duration": "12.83",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4b18fc20-5e97-4c7b-aba6-edf79a6b051e",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/5/2026 5:05:02",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8e42c04b-68e8-469d-a4cc-88769145bc72",
    "empId": "1035",
    "type": "Break 2 Start",
    "timestamp": "9/5/2026 5:49:18",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bb5488b8-e747-4bac-b55c-184d70ce7372",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/5/2026 6:00:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bbabac33-ba2d-4b17-85ac-a24cb98073a3",
    "empId": "1035",
    "type": "Break 2 End",
    "timestamp": "9/5/2026 6:02:34",
    "duration": "13.27",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "47b74ec8-978f-4368-aa0e-c9c03a6e74f6",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/5/2026 6:06:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6d4bcf92-2497-440d-8730-5c8e3da23410",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/5/2026 6:14:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "dddbca5c-2f6e-4562-8b46-ed94c96c73ad",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/5/2026 7:02:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ce97b51d-b770-426b-b760-88e4800d378c",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/7/2026 10:52:44",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5c5dab6a-da11-43e3-806e-419c09a41e99",
    "empId": "1820",
    "type": "Break 1 Start",
    "timestamp": "9/7/2026 10:52:49",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e0fbb589-f99c-4ead-9301-0c4394f09757",
    "empId": "1820",
    "type": "Break 1 End",
    "timestamp": "9/7/2026 11:07:20",
    "duration": "14.52",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "596b8a62-40ab-47d5-8399-725d083af9d0",
    "empId": "1820",
    "type": "Break 2 Start",
    "timestamp": "9/7/2026 16:09:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "83fd04a4-6ab4-44c7-be06-7ac1e778e8a8",
    "empId": "1820",
    "type": "Break 2 End",
    "timestamp": "9/7/2026 16:21:40",
    "duration": "12.18",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a6e8744c-ae53-4196-935f-bbcf2920d278",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/7/2026 18:09:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "90e7b398-423c-43a7-a614-80ecc3e0d20f",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/7/2026 18:16:23",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "1f310547-9eeb-4a3d-872f-9af2d17d996c",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/7/2026 18:16:43",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "1767f2c7-880a-47ec-8edb-6429c4a28188",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/7/2026 18:17:06",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "a8a2d6eb-ce04-4024-9501-4aa70b05b38a",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "9/7/2026 19:13:09",
    "duration": "63.62",
    "status": "Overlunch",
    "overDuration": "3.62"
  },
  {
    "id": "cccd6f83-03f6-4e62-ab22-12300d713abe",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/7/2026 19:39:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e5334121-6f97-4b97-9b6e-997f2b146b34",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/7/2026 20:36:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "af8e3753-b125-43b8-bc32-1193be757672",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/7/2026 21:22:25",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "fd5089f1-8449-4eed-bdd3-3048e0763f07",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/7/2026 23:04:14",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3674a21a-f258-4dd2-8b8a-3a41933d984e",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/7/2026 23:16:19",
    "duration": "12.08",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f9ed87b8-0f02-4268-8120-266a66c2924b",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/8/2026 1:31:50",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e1f6c47e-f166-4553-aaed-2b05a801321f",
    "empId": "1035",
    "type": "Break 1 Start",
    "timestamp": "9/8/2026 1:58:13",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bb2493fb-683a-4b3f-b36d-3d1c6e5f9d07",
    "empId": "1035",
    "type": "Break 1 End",
    "timestamp": "9/8/2026 2:02:21",
    "duration": "4.13",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bdf0a6f1-31b4-4636-a3b1-a1790461b802",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "9/8/2026 2:23:19",
    "duration": "51.48",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "93d40b6b-416a-463d-ae0c-29aa33a5376a",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/8/2026 5:34:12",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3f3ebab3-ff4b-48d7-95f6-a0a4d72b0501",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/8/2026 5:55:02",
    "duration": "20.83",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "89b17f41-2469-4f50-83fa-0b64d894bca6",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/8/2026 6:00:44",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "52449179-3db6-4af3-8006-b2ed29dc4d60",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/8/2026 6:05:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1ded9edc-3c1f-4f03-ac8c-3aed370d715f",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/8/2026 10:39:02",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "cd6a3dc9-1e64-49b7-b557-08dd7bf561bf",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/8/2026 10:39:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d2d8d3bf-f747-41dc-9687-8ee516be458c",
    "empId": "1820",
    "type": "Break 1 Start",
    "timestamp": "9/8/2026 13:47:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3b3aa27c-16a3-439b-a936-bc7dea78c4f4",
    "empId": "1820",
    "type": "Break 1 End",
    "timestamp": "9/8/2026 14:00:32",
    "duration": "12.55",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "98cf3272-54c5-4b24-b48b-26ca1fc73e04",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/8/2026 16:42:34",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "65487eaf-df5a-4d99-bcb5-f3675075cab4",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/8/2026 16:52:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ce79e56f-8c4e-4137-9372-eab78d37b124",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/8/2026 18:09:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5ead05dc-87ab-44c9-8da1-22432458fd65",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "9/8/2026 18:44:29",
    "duration": "34.93",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f6e7987c-e62c-49ba-8290-fd54d420142e",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/8/2026 20:02:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "37143333-0f40-47d5-8d86-149bd3ed84cf",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/8/2026 20:03:34",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "f987ae1d-c3b1-46f8-a662-168c4418ae11",
    "empId": "2610",
    "type": "Break 1 Start",
    "timestamp": "9/8/2026 20:08:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "010fa3c3-7052-4778-9206-bb4d264779ce",
    "empId": "2610",
    "type": "Break 1 End",
    "timestamp": "9/8/2026 20:20:25",
    "duration": "12.35",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "08a54f43-1cab-430e-b495-360eeab808a4",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/8/2026 20:28:42",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6bcb5aa5-a471-4aa2-94d5-0b3cd7e0c4fc",
    "empId": "836",
    "type": "Shift Start",
    "timestamp": "9/8/2026 20:44:10",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "efa6fc53-ce2c-425b-861a-9ecbb33ea0f4",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/8/2026 20:45:12",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "24c5fda2-88fe-4e4d-8965-7842a037dd4d",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/8/2026 21:00:36",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "4a887d8d-692e-41dc-8e74-e46957c766ca",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/8/2026 21:04:04",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "46dc2a2b-5480-43d5-8287-e7674625a7cb",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/8/2026 21:08:30",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "d7be4409-48d0-41e9-84cd-c67fd2e0dd57",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/8/2026 21:59:18",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "5f9d07a0-017c-48db-a3b1-34d2de9f36a7",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/8/2026 22:01:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f69afbf5-5e18-40d1-8167-927b98a0903c",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/8/2026 22:13:22",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "454197f2-1e8b-4b35-9897-8069dcac14ea",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/8/2026 22:36:55",
    "duration": "23.55",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "195e2912-dc63-41e4-9033-aa2b5fdec92e",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/8/2026 22:43:32",
    "duration": "41.6",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cb3eb516-ed86-4ca5-afdc-86c47cb85d89",
    "empId": "1880",
    "type": "Break 1 Start",
    "timestamp": "9/8/2026 23:02:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d5652fc7-035f-437e-8417-76ccc19ce837",
    "empId": "1880",
    "type": "Break 1 End",
    "timestamp": "9/8/2026 23:06:25",
    "duration": "4.02",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9b5c6582-557d-4f11-b446-bd11e9df3719",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/8/2026 23:15:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7104ee88-5102-4ef9-a259-eb95a7495e0f",
    "empId": "1006",
    "type": "Break 1 Start",
    "timestamp": "9/8/2026 23:20:42",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0f9885c1-a818-44db-ae30-aa946d5042f3",
    "empId": "1006",
    "type": "Break 1 End",
    "timestamp": "9/8/2026 23:26:05",
    "duration": "5.38",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "40c4538b-0338-4cb4-9d3d-938503c319ac",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/8/2026 23:27:09",
    "duration": "12.05",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a67bc007-dfa5-42d7-9c48-af74adc58055",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/8/2026 23:30:48",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "32d77f68-0884-4d01-a044-e9baae21bbd0",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/8/2026 23:43:31",
    "duration": "12.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8ecc990e-f5c4-48db-82de-1af07395b852",
    "empId": "1035",
    "type": "Break 1 Start",
    "timestamp": "9/8/2026 23:52:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "faa3e10e-7a80-4119-b71e-6230815411a1",
    "empId": "1035",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 0:05:38",
    "duration": "12.78",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "98ff802c-476d-4305-a585-2007bf0c8e18",
    "empId": "836",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 0:22:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "df01a44e-9a14-4be9-8afe-658dd323c027",
    "empId": "836",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 0:34:57",
    "duration": "12.07",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d568e179-e567-4a6a-b72d-c9ae4ba5b5ac",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "9/9/2026 2:07:48",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1ba3371b-34cf-41dd-b7a1-eef8ce978024",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/9/2026 2:10:18",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ff8ca6a2-b7ab-4e51-98c6-839c38b2d6e0",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/9/2026 2:20:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6296d10e-0a6e-4ad2-96ec-5cba09aa44bf",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "9/9/2026 2:41:20",
    "duration": "33.53",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5e411737-9124-497d-923a-abffd344cb46",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/9/2026 2:50:23",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "54dd73df-6a4b-49cc-b15e-5957bae40604",
    "empId": "123",
    "type": "Shift Start",
    "timestamp": "9/9/2026 3:02:22",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "3e4c218d-757a-47b9-9315-6187536d5175",
    "empId": "1898",
    "type": "Shift Start",
    "timestamp": "9/9/2026 3:04:05",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "2121acb8-40cc-442d-8908-a58f0ebd8696",
    "empId": "1898",
    "type": "Shift End",
    "timestamp": "9/9/2026 3:04:32",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "18181385-75ce-4289-83c4-1bc4d4df17bc",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "9/9/2026 3:06:49",
    "duration": "56.52",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "56502e4c-03ed-4879-8af8-0b44ff713e20",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/9/2026 3:07:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c071f4f0-68dd-42ed-85b4-14c931e6497a",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/9/2026 3:48:33",
    "duration": "88.05",
    "status": "Overlunch",
    "overDuration": "28.05"
  },
  {
    "id": "a8b18c3d-01dc-4e2e-b1f0-d38dd64979b3",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/9/2026 4:05:26",
    "duration": "58.17",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "75114807-ad9b-4312-88e5-fa5142b73a4c",
    "empId": "1006",
    "type": "Break 2 Start",
    "timestamp": "9/9/2026 4:20:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4c98921e-daaa-4440-82dd-c431babf45d4",
    "empId": "946",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 4:20:15",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c4b06950-e763-4538-9d4a-eae9c0332869",
    "empId": "1597",
    "type": "Break 2 Start",
    "timestamp": "9/9/2026 4:20:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8a9c1718-f28a-4466-90d5-543431f99c7d",
    "empId": "1006",
    "type": "Break 2 End",
    "timestamp": "9/9/2026 4:28:59",
    "duration": "8.8",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "eb47266e-59fc-404e-8fbe-7f258abd9035",
    "empId": "1597",
    "type": "Break 2 End",
    "timestamp": "9/9/2026 4:32:27",
    "duration": "12.03",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4767c3ce-4bd6-4b85-be10-a5bc472e35a3",
    "empId": "946",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 4:33:56",
    "duration": "13.68",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cc836ece-7173-40f7-bd7d-47637c5cb81e",
    "empId": "1772",
    "type": "Break 2 Start",
    "timestamp": "9/9/2026 4:50:36",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ac3ad0a3-b8c1-4dd7-94b5-01d8fa8b4f78",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/9/2026 4:52:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d658993a-df1c-44de-a037-f0e1d85a6742",
    "empId": "1772",
    "type": "Break 2 End",
    "timestamp": "9/9/2026 5:03:20",
    "duration": "12.73",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "068ad28c-a3e4-4d0c-93b3-778ade137b5e",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/9/2026 5:05:50",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "420c8a18-c273-4b56-9e76-9715540106c5",
    "empId": "1035",
    "type": "Break 2 Start",
    "timestamp": "9/9/2026 5:17:12",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5a0eecdd-8c98-47f5-93d5-155ede624638",
    "empId": "1035",
    "type": "Break 2 End",
    "timestamp": "9/9/2026 5:29:55",
    "duration": "12.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "560023d7-998f-4fad-bd4f-d324ebbcd3e4",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/9/2026 6:01:35",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6fd1a032-078c-4208-b231-d046f5b61f4a",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/9/2026 6:07:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5e035ea9-0f91-4ca4-af43-59f101f10f5b",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/9/2026 7:00:57",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d664ed9f-993d-4df7-982d-f2d0c1df3473",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/9/2026 13:31:54",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "8cf2c752-8296-4c2f-b939-f9dcbf663adc",
    "empId": "1820",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 16:00:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "27830075-c0f0-4d57-a837-2427d0a6e76c",
    "empId": "1820",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 16:12:20",
    "duration": "12.07",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b672c29a-bd5f-433d-80dd-5133ea0397b0",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/9/2026 17:13:57",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "c8c5c177-3bc9-4fc3-b8e6-a5d63a480176",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/9/2026 19:08:47",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "e6bf0029-2b56-4f3c-954e-43fbcaaf7bd0",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/9/2026 19:42:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1692bf51-9d31-4e30-95ce-449dccfc9b29",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/9/2026 19:54:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1825bbcc-9b4d-49d5-ba5f-78b22453d23b",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/9/2026 20:37:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d7c757f7-f2a0-40b9-8549-40868eda3b6c",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "9/9/2026 20:43:40",
    "duration": "60.92",
    "status": "Overlunch",
    "overDuration": "0.92"
  },
  {
    "id": "1e2f877f-816c-4173-9fa0-4e401d0ef5ee",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/9/2026 20:45:34",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "f6b1228b-93bf-4362-a3b0-184d631bc198",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/9/2026 20:48:20",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "ac646498-70c3-4d8d-bd7e-bba560316a3f",
    "empId": "836",
    "type": "Shift End",
    "timestamp": "9/9/2026 20:48:30",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "e688d7a4-f076-4b4b-af9a-37ae44a79917",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/9/2026 20:48:47",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "496d929a-e2be-413b-8013-6441ea892e7f",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/9/2026 20:49:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "10afdc07-fa69-4cd0-8aaf-bfaf071db714",
    "empId": "836",
    "type": "Shift Start",
    "timestamp": "9/9/2026 20:53:44",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1f1fcb21-b374-464e-863a-af86faabaffa",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/9/2026 21:00:50",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "23710af7-58f6-4f88-b0df-ab1ef8f63d9b",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/9/2026 21:03:15",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "5bb9eee2-f193-4470-85e2-17afc3e38af4",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/9/2026 21:05:11",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "45bfc6c7-7799-47b7-8a45-1247a00ab688",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/9/2026 21:56:35",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "db2be6fb-7bf3-4518-9a5f-f4cac7253c74",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "9/9/2026 22:05:58",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "90dab48d-5512-4da5-929d-68c0f3e78040",
    "empId": "1954",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 22:06:03",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a8bc8238-0f75-45ec-a021-3c78cc7587c3",
    "empId": "1954",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 22:06:24",
    "duration": "0.35",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cdf33dd8-9303-4851-b7d8-b1d4a1586190",
    "empId": "2298",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 22:21:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fb0e4861-2735-417b-adfb-a2c5301a4c53",
    "empId": "2298",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 22:32:12",
    "duration": "10.82",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "27c826b3-e380-4730-8b7e-7c65e19e0941",
    "empId": "836",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 23:03:54",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8f81be74-3a01-46b3-81b4-f49d63eee4d3",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 23:04:05",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c188ebb2-c529-4129-9933-81f48b142295",
    "empId": "2610",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 23:04:39",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e4a3cc6a-e01e-447e-99da-44df90bdd999",
    "empId": "1880",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 23:05:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "896bda19-848c-4027-8025-457be26e9e43",
    "empId": "1880",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 23:12:36",
    "duration": "7.2",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a570ed15-9bbc-44e3-b6a3-f5304e7ef8b9",
    "empId": "2610",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 23:14:20",
    "duration": "9.68",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e4e442c9-fa99-4fad-883e-8e5b418ae9d7",
    "empId": "836",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 23:16:08",
    "duration": "12.23",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f8ebe427-f765-43e3-ad21-e2c0928aaa5f",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 23:20:04",
    "duration": "15.98",
    "status": "Overbreak",
    "overDuration": "0.98"
  },
  {
    "id": "25e86d21-570a-49f4-a8f8-5fecf1fad825",
    "empId": "1006",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 23:23:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0129c060-cc92-43da-afb5-ecb29747e809",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/9/2026 23:30:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "83f9f107-888c-462a-b249-5feda15c626e",
    "empId": "1006",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 23:36:30",
    "duration": "13.38",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "916bd3d5-b981-4c46-998b-a962c4abbe5c",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/9/2026 23:37:21",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "83bece28-7b76-4e0d-a34c-666ecde33a80",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 23:43:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "075620d3-4614-4078-a280-f5177e3abc93",
    "empId": "946",
    "type": "Break 1 Start",
    "timestamp": "9/9/2026 23:49:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3bda509e-c0aa-427e-9e4a-c14140b01510",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/9/2026 23:55:35",
    "duration": "12.13",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cede7295-6f16-44aa-98c9-97d4e84d486d",
    "empId": "946",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 0:01:56",
    "duration": "12.52",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0ee42419-e08f-4695-a4cf-c8e843ea8699",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/10/2026 0:36:58",
    "duration": "59.62",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2410cd4e-a3b3-4489-908f-cca2ebb250cb",
    "empId": "1035",
    "type": "Break 1 Start",
    "timestamp": "9/10/2026 0:59:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fe4837fb-fa06-4f27-9f95-8497b49982e5",
    "empId": "1035",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 1:05:44",
    "duration": "6.25",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a6a2670e-abf4-479b-8828-e9f8ef09fddc",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/10/2026 1:06:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f4124ad6-96e1-4d26-9282-9e6c7fa8cad1",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/10/2026 1:18:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f5465957-492a-48d6-8a92-4b32e9ebce31",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/10/2026 1:24:36",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0329da84-ff35-4ad3-9571-0686dffc1f0d",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/10/2026 1:34:00",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "75f686a6-462a-4f96-bc79-15ffd68fd45e",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "9/10/2026 1:35:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "65913266-fbeb-4ec9-ba28-4c0ef11c4774",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/10/2026 1:59:36",
    "duration": "52.75",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "293dca1b-7855-4fba-a772-aa2c34fbfe3a",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/10/2026 2:10:30",
    "duration": "45.9",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "72aaf712-ff6b-4595-b843-f7c9f92a9596",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/10/2026 2:10:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "47f6ed84-1136-474f-a3d2-bc3e26388b64",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "9/10/2026 2:15:43",
    "duration": "57.7",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1280ced8-e6fe-4748-b9f5-919d1351b697",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "9/10/2026 2:19:34",
    "duration": "44.43",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6db4301e-7284-4a84-a6d2-f32f5c763bc0",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/10/2026 2:20:27",
    "duration": "46.45",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3ce15f2b-0c7d-4b96-90de-08becca10aed",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/10/2026 2:30:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bd38d143-ce39-46f7-a6d4-6f12e7babcee",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/10/2026 3:22:59",
    "duration": "72.43",
    "status": "Overlunch",
    "overDuration": "12.43"
  },
  {
    "id": "862ec526-79bb-462b-81c0-ae40b7416916",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/10/2026 3:28:06",
    "duration": "57.62",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "30c5f0db-11d9-4d30-a19f-b94235c509b7",
    "empId": "1880",
    "type": "Break 2 Start",
    "timestamp": "9/10/2026 4:07:47",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ab9a4053-53fa-4933-8afa-70499fcfac95",
    "empId": "1597",
    "type": "Break 2 Start",
    "timestamp": "9/10/2026 4:08:15",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fd080c0b-431a-4da7-94b5-787a8481d904",
    "empId": "1880",
    "type": "Break 2 End",
    "timestamp": "9/10/2026 4:11:57",
    "duration": "4.17",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "004da395-8ddb-4c6b-bb6f-e9654afd2434",
    "empId": "1597",
    "type": "Break 2 End",
    "timestamp": "9/10/2026 4:20:35",
    "duration": "12.33",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bf81c151-ce7f-479c-adea-c3f5f38315d2",
    "empId": "2610",
    "type": "Break 2 Start",
    "timestamp": "9/10/2026 4:32:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "03959662-c5f5-49fa-a6ed-dfd72320bbc6",
    "empId": "1772",
    "type": "Break 2 Start",
    "timestamp": "9/10/2026 4:36:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b01ed210-3487-4471-8bd9-ddeb3c481beb",
    "empId": "2610",
    "type": "Break 2 End",
    "timestamp": "9/10/2026 4:44:34",
    "duration": "12.08",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "dbe349ec-5088-49a6-b6f1-abcce002dac8",
    "empId": "1772",
    "type": "Break 2 End",
    "timestamp": "9/10/2026 4:49:12",
    "duration": "12.82",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "857d6e51-21c9-41dd-855f-0c88252a8cea",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/10/2026 5:05:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "338c39b2-3f06-48ea-8d99-d49d12c07871",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/10/2026 6:00:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1e9d25a2-7d78-4ff4-8d52-890f69315fba",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/10/2026 6:02:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9e4479e8-f586-4285-be11-901c2cf1d7ff",
    "empId": "836",
    "type": "Shift End",
    "timestamp": "9/10/2026 6:04:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ec668ccd-ca85-43f4-a6a4-92b4370a42eb",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "9/10/2026 6:06:05",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ad168311-ef5f-4594-8f76-3d6cd7212f20",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/10/2026 10:52:48",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "476ebca5-2e65-4de2-81f6-d68ea5bd3219",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/10/2026 14:47:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e7182bc4-c951-4061-87d5-71e6278d866e",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/10/2026 15:05:22",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "895a1e4c-6388-49cb-99e0-44956f657ad3",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/10/2026 15:05:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cb3b720c-cbe4-4bf2-9ff5-7d3d304037d4",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "9/10/2026 15:45:48",
    "duration": "58.05",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "22493cc5-2d1c-410a-9067-bc39b6c00240",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/10/2026 16:19:18",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "595ffd7c-bafe-469e-be57-2ff1c88b6dda",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/10/2026 16:19:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9e0ea7cb-afc5-47f7-aeca-00e25818490b",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/10/2026 16:41:41",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "d2f796a0-d1e2-4e10-825b-94afbf0db687",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/10/2026 16:41:50",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "898795ac-d960-4fed-970d-d26591d96dc1",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/10/2026 17:19:30",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "c4e39a23-5f54-4716-a90f-f8e5937930eb",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/10/2026 17:19:44",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "b64905ad-ccda-4e58-b751-7a742fc2a540",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/10/2026 18:13:17",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "0fea83bb-0f56-4985-b180-8b09dee11494",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/10/2026 18:13:21",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "4a9908f7-c6bf-4772-b75c-e63362ffa2fd",
    "empId": "1820",
    "type": "Break 1 Start",
    "timestamp": "9/10/2026 18:56:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "606b7009-33c8-47af-961c-7c0415e51f3f",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/10/2026 18:57:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "39e0b54b-53f0-47a1-86c7-7f195338805c",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 19:08:13",
    "duration": "10.3",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8c684070-f89e-46a9-ab20-ff285767c827",
    "empId": "1820",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 19:08:44",
    "duration": "12.63",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "57546e9c-e74c-48bd-bc99-51d31e35e4ae",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/10/2026 19:51:35",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "691911c6-a393-4ffe-94e4-2b934b56c6ea",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/10/2026 20:03:17",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fc7b4a79-7a93-4041-a69e-a1a063cbf0cd",
    "empId": "2385",
    "type": "Break 1 Start",
    "timestamp": "9/10/2026 20:03:28",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b8ae9fc4-42d4-4131-89f0-4b1150d6637a",
    "empId": "2385",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 20:20:45",
    "duration": "17.28",
    "status": "Overbreak",
    "overDuration": "2.28"
  },
  {
    "id": "3ff6a70e-4e59-46a2-b027-f065fa6f109e",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/10/2026 20:40:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6411483c-d56b-4d4d-9a71-2ffaab4d2671",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/10/2026 20:47:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b8940643-b837-4ccf-a4a9-f9a54c55c8ed",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/10/2026 20:53:54",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "7026cbe7-68f7-4203-be72-597c7e029c67",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/10/2026 20:56:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "535f151f-9254-47c2-b477-c3e37aae501c",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/10/2026 21:00:35",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "4e4df203-fdab-4735-9139-17c7214ab998",
    "empId": "836",
    "type": "Shift Start",
    "timestamp": "9/10/2026 21:03:56",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "aa647790-0ec4-4cec-8eda-fd93c1176549",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/10/2026 21:54:04",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "caa8e3e7-9cc8-4890-bafb-67acb3a507d2",
    "empId": "2298",
    "type": "Break 1 Start",
    "timestamp": "9/10/2026 22:26:58",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "aba3edba-0aa5-4835-bb4d-264bdb6a139c",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/10/2026 22:39:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6777acb6-8266-4e36-b775-0aad38ca5be8",
    "empId": "2298",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 22:39:40",
    "duration": "12.7",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "97ba2c02-4a24-44fc-9c8f-5ab23fc4f4c8",
    "empId": "2610",
    "type": "Break 1 Start",
    "timestamp": "9/10/2026 23:00:26",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "13147ff8-735c-44b7-8423-e2b0d9600448",
    "empId": "1880",
    "type": "Break 1 Start",
    "timestamp": "9/10/2026 23:03:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "16c7dcc3-84d3-4470-b3cd-b0c65e113bfe",
    "empId": "1006",
    "type": "Break 1 Start",
    "timestamp": "9/10/2026 23:13:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d131f58a-4c4c-4224-88a8-74362f59eb0c",
    "empId": "1880",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 23:13:28",
    "duration": "10.02",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "80f3bbe9-ff82-47a5-8049-b3603b039885",
    "empId": "1006",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 23:26:13",
    "duration": "12.82",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9fcb2696-c2ec-4c4e-a97f-b1baec57317a",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/10/2026 23:27:35",
    "duration": "47.97",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "68432d07-71b4-4d67-8ad4-24056139889c",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/10/2026 23:32:02",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "605dc569-b369-44c2-b2e2-6db50667aa42",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 23:46:11",
    "duration": "14.15",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "34bce0be-15c2-4b4f-bdca-00812d916de9",
    "empId": "2610",
    "type": "Break 1 End",
    "timestamp": "9/10/2026 23:58:59",
    "duration": "58.55",
    "status": "Overbreak",
    "overDuration": "43.55"
  },
  {
    "id": "e7c48d3c-c403-4890-bd18-eb206e46518f",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/11/2026 0:05:22",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "64812521-de83-4050-bceb-e85ffc708a7b",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/11/2026 0:57:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "64bed842-fd63-410e-8625-fae2cf2cf436",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/11/2026 1:09:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "02dc74cb-36e8-45ef-b113-04b9f6040380",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/11/2026 1:13:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "409a6691-a166-4c26-bb3c-4e0f4f9d21f0",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/11/2026 1:18:12",
    "duration": "20.22",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8a3d2691-17d4-4cb0-9204-77c635c41c2d",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/11/2026 1:28:05",
    "duration": "14.9",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9ba3582f-edc7-48e9-8060-035b68848328",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "9/11/2026 1:58:17",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "be073d21-fd3c-434b-822f-d9f74fd68514",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/11/2026 2:01:37",
    "duration": "52.43",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "137f02b0-d574-47e1-9c10-b4a60799a391",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/11/2026 2:02:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b9bc91f8-a177-4cfa-8b70-cd4ba759417e",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/11/2026 2:03:28",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "894e5e85-f065-419f-b4c6-17b8abbe6bd2",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "9/11/2026 2:39:24",
    "duration": "41.12",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a8dac2ae-3428-49f0-9934-27a1014e6ce0",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/11/2026 3:01:16",
    "duration": "57.8",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7523d453-af2e-4f37-9450-acd3b4e10489",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/11/2026 3:19:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "16298f62-b983-4c3e-8723-ebb363525446",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/11/2026 4:17:37",
    "duration": "57.7",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7e13c3e4-af34-4dcc-af00-5b220cf5aeee",
    "empId": "946",
    "type": "Break 1 Start",
    "timestamp": "9/11/2026 4:33:20",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e20a663e-72a4-4ee1-8c74-ebe30c593aca",
    "empId": "1772",
    "type": "Break 2 Start",
    "timestamp": "9/11/2026 4:34:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f42ad42e-e54b-403a-a01e-204de970ea5b",
    "empId": "946",
    "type": "Break 1 End",
    "timestamp": "9/11/2026 4:46:39",
    "duration": "13.32",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0993fb7f-7e58-4116-9f1d-c902ba0f22be",
    "empId": "1772",
    "type": "Break 2 End",
    "timestamp": "9/11/2026 4:49:04",
    "duration": "14.67",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8ed053e8-b0eb-4c4d-bdca-9f73ebdf3ce3",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/11/2026 5:05:39",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2b6a0594-6f20-49d7-a108-a88f8d04f211",
    "empId": "2610",
    "type": "Break 2 Start",
    "timestamp": "9/11/2026 5:15:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "989c0954-3396-4693-9fc2-8b0b43ae23f5",
    "empId": "2610",
    "type": "Break 2 End",
    "timestamp": "9/11/2026 5:32:53",
    "duration": "17.35",
    "status": "Overbreak",
    "overDuration": "2.35"
  },
  {
    "id": "180fc11c-6dd5-426f-be05-1c0530574388",
    "empId": "1035",
    "type": "Break 1 Start",
    "timestamp": "9/11/2026 5:37:47",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9804e2aa-8d84-4883-864e-f5333a2f0d89",
    "empId": "1035",
    "type": "Break 1 End",
    "timestamp": "9/11/2026 5:50:28",
    "duration": "12.68",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "36b6e409-4498-4006-a868-8641d881ae47",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/11/2026 6:00:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a57ac487-4c7a-430e-bff4-c9a4f3c8f1c7",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/11/2026 6:01:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2e30f706-771c-4d46-9c6c-a9cf599bf23a",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/11/2026 6:01:39",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "02b99611-d177-47a1-aace-cbc1b3e9feb6",
    "empId": "836",
    "type": "Shift End",
    "timestamp": "9/11/2026 6:08:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "197f1584-cfbd-442b-89f8-fd118d8e4b9d",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/11/2026 6:10:22",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3deafaaa-89c5-4a50-80a5-dae6f652b82d",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/11/2026 6:17:21",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "37b91864-597f-4385-88b3-9afbb9f140e8",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/11/2026 7:01:22",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "05c856bc-b06b-460c-884e-20d86146aa9a",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/11/2026 10:10:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8e8c2fa9-3487-4933-92af-db84dbc1e702",
    "empId": "1820",
    "type": "Break 2 Start",
    "timestamp": "9/11/2026 14:39:36",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "240be42a-6355-4f47-8a25-518b8644c337",
    "empId": "1820",
    "type": "Break 2 End",
    "timestamp": "9/11/2026 14:51:47",
    "duration": "12.18",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9d139b58-120a-487d-b82e-a67cba444eb0",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/11/2026 17:00:10",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "0fcf6590-490e-4c5f-8db6-3e74fac445d3",
    "empId": "1820",
    "type": "Break 2 Start",
    "timestamp": "9/11/2026 17:48:35",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "63200c5a-0650-4e8a-98d1-2c12152302b9",
    "empId": "1820",
    "type": "Break 2 End",
    "timestamp": "9/11/2026 18:03:33",
    "duration": "14.97",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ccdc06cc-68d5-4a9b-a264-79a179afd87e",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/11/2026 18:49:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "406c42b4-e149-460c-82df-1c5bd6a42db4",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "9/11/2026 19:32:13",
    "duration": "43.12",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3ebc0d68-e622-48b9-82be-ee68eb0a01c4",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/11/2026 20:05:36",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6410b94b-e2b4-4a93-8ff5-75a063fdb693",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/11/2026 20:07:05",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "b5acb8ae-51ab-4e5c-97fb-9b378015667c",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/11/2026 20:29:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5e9470a3-e7ac-4140-bb9a-cc56cb186122",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/11/2026 20:34:04",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "12a935d8-39fe-4853-9c4a-51531b2ed9bb",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/11/2026 20:44:14",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "fdf68e5e-f7c9-4bcb-91df-24d2956b71bd",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/11/2026 20:44:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "682263b9-56de-4147-b5b4-addfba41eb54",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/11/2026 20:56:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3d199173-dfb4-4690-8a76-9fd95b313d4d",
    "empId": "836",
    "type": "Shift Start",
    "timestamp": "9/11/2026 21:01:59",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "eb4a14ad-f7c5-4a0c-8a6c-68733feb5f16",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/11/2026 21:02:29",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "f0daa086-a193-43dc-bc63-43629d78483f",
    "empId": "2298",
    "type": "Break 1 Start",
    "timestamp": "9/11/2026 22:40:44",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5eca40d8-dc88-4fda-8f5f-e8744ee1b04c",
    "empId": "2385",
    "type": "Break 1 Start",
    "timestamp": "9/11/2026 22:43:14",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0c70a1fd-8895-4601-b914-b3b4ddc7d1de",
    "empId": "2298",
    "type": "Break 1 End",
    "timestamp": "9/11/2026 22:53:04",
    "duration": "12.33",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "089f4acc-414b-4f71-b496-8b019100d3ee",
    "empId": "2385",
    "type": "Break 1 End",
    "timestamp": "9/11/2026 22:53:15",
    "duration": "10.02",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7dfdf61f-ab56-4f0e-a9d4-6c60299f261d",
    "empId": "2610",
    "type": "Break 1 Start",
    "timestamp": "9/11/2026 23:12:15",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "44b0233b-4bfd-443a-845e-70277fc214fd",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/11/2026 23:15:02",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a479a4b9-a2ac-4e3b-b2a9-adbcc52664cb",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/11/2026 23:19:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0c218420-9396-4a39-9935-b008048c6cd6",
    "empId": "946",
    "type": "Break 1 Start",
    "timestamp": "9/11/2026 23:19:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a24291fb-59ee-4340-ab93-f1840bea1efb",
    "empId": "2610",
    "type": "Break 1 End",
    "timestamp": "9/11/2026 23:23:49",
    "duration": "11.57",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "304a9dcb-2502-4dce-b3b0-10dec87093d3",
    "empId": "946",
    "type": "Break 1 End",
    "timestamp": "9/11/2026 23:32:28",
    "duration": "12.48",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0b4a994b-5793-476a-a48f-3696a6beb835",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/11/2026 23:32:46",
    "duration": "12.83",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0403c891-9fba-4392-8b16-9037d63aa81e",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/12/2026 0:00:13",
    "duration": "45.18",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bbb2e945-8e2a-451c-a975-cf3a37bbd4fa",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/12/2026 0:00:50",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d0f18573-49f5-4ad7-8a51-59a833f7d54a",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/12/2026 0:14:16",
    "duration": "13.43",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b5293a85-4449-4f06-8516-12c16ed1f816",
    "empId": "2298",
    "type": "Start Lunch",
    "timestamp": "9/12/2026 0:50:17",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "04fa34c5-18cf-4865-ab4e-a819f9e2ef31",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/12/2026 0:58:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "728c6b63-031f-438d-a873-6558867a01b5",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/12/2026 1:10:18",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8201fae7-0809-485b-9d19-30a1db8d6244",
    "empId": "836",
    "type": "Start Lunch",
    "timestamp": "9/12/2026 1:11:03",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d7d72b81-a0f1-4767-be9a-3786f07c98b7",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/12/2026 1:11:04",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2569bd25-a6f5-4851-a5b5-bf6ab57e6d44",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/12/2026 1:11:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "aa4a1679-3c83-4c75-aefe-02b40e00fb94",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/12/2026 1:16:47",
    "duration": "18.23",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "91063386-87b9-45b0-a31b-ddae11bb003f",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "9/12/2026 1:31:43",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9fa5ecd4-e465-49c6-a172-5f87da4fd00e",
    "empId": "2298",
    "type": "End Lunch",
    "timestamp": "9/12/2026 1:48:57",
    "duration": "58.67",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3b6b0e76-4b15-42b6-8b45-05538c073be8",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "9/12/2026 1:51:25",
    "duration": "41.12",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b4af0b8f-6f65-4e3b-b295-0ee86299af7e",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/12/2026 2:01:53",
    "duration": "50.77",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2278ba45-cfde-4faa-aca5-532017a9f4b8",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/12/2026 2:08:42",
    "duration": "57.63",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "80019472-5e6b-4334-810a-f02b1af288be",
    "empId": "836",
    "type": "End Lunch",
    "timestamp": "9/12/2026 2:08:46",
    "duration": "57.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2bb59ea8-753d-4c3c-a303-031dff0744ef",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/12/2026 2:08:47",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "abb7334b-d29b-4056-bea7-c8d8a9509896",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "9/12/2026 2:19:27",
    "duration": "47.73",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d07ea7ef-baf7-4672-8b90-1aeec11e2e0b",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/12/2026 3:01:07",
    "duration": "52.33",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b52efe1a-f9f6-4edf-bf19-c7e69ba396f2",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/12/2026 3:24:10",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "de221352-4197-43a9-8281-4bee4b1c2c2b",
    "empId": "2298",
    "type": "Break 2 Start",
    "timestamp": "9/12/2026 3:32:14",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "290f271a-8fa7-4124-b19d-7e2d559f62d7",
    "empId": "2298",
    "type": "Break 2 End",
    "timestamp": "9/12/2026 3:44:39",
    "duration": "12.42",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a2fa7f10-1433-40e5-8a1a-2ebfb50013ac",
    "empId": "1597",
    "type": "Break 2 Start",
    "timestamp": "9/12/2026 4:12:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "81223063-f75f-45ec-8369-be5621e16050",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/12/2026 4:13:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8758b0f9-d243-4765-b47c-77cccf59408d",
    "empId": "1597",
    "type": "Break 2 End",
    "timestamp": "9/12/2026 4:25:16",
    "duration": "12.73",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "123c083d-82ef-4f03-8d23-0419450c41ab",
    "empId": "1772",
    "type": "Break 2 Start",
    "timestamp": "9/12/2026 4:56:41",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f683ec1f-c93b-4130-b569-61567a9bc999",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/12/2026 5:04:26",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4dadcca8-395d-4dc9-b177-6cbbc94b3b61",
    "empId": "1772",
    "type": "Break 2 End",
    "timestamp": "9/12/2026 5:13:09",
    "duration": "16.47",
    "status": "Overbreak",
    "overDuration": "1.47"
  },
  {
    "id": "52ef4770-f36b-42fd-8e9a-61682b0e3dd9",
    "empId": "2610",
    "type": "Break 2 Start",
    "timestamp": "9/12/2026 5:13:38",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e1205a59-67f9-485e-bfc4-cabf7db66394",
    "empId": "2610",
    "type": "Break 2 End",
    "timestamp": "9/12/2026 5:24:44",
    "duration": "11.1",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "968d69a4-b3d1-456e-a904-68a649816970",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/12/2026 6:01:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6fe93bf8-49f9-435a-81f0-7014b67d0e29",
    "empId": "836",
    "type": "Shift End",
    "timestamp": "9/12/2026 6:01:44",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "dac89cf1-936d-4aa1-97f8-850c76e262d3",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/12/2026 6:02:41",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f0d8f128-b380-4d40-84c2-431c5c28b2dc",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/12/2026 6:06:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "657a25c3-32de-4041-b942-dddb9506f2c7",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/12/2026 6:06:41",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b3215c18-f18d-4f0d-b4fe-2f07b3c6c7d2",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/12/2026 6:10:00",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d851e4b4-81cb-48f0-a874-d6cb7bfd367b",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/12/2026 6:28:49",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "14019587-9d74-4015-96d8-4626c4cacba8",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/12/2026 7:04:58",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a75ce92b-0a66-492a-bd75-b5e7a2f7a72d",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/12/2026 8:02:39",
    "duration": "57.68",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0d20b670-c20d-4b7a-b50c-c009f49d3e4e",
    "empId": "1035",
    "type": "Break 1 Start",
    "timestamp": "9/12/2026 9:54:15",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "931799bd-54f1-4157-8648-253b4c65f0e2",
    "empId": "1035",
    "type": "Break 1 End",
    "timestamp": "9/12/2026 10:06:58",
    "duration": "12.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "769b09af-116a-44c3-a3df-d37529ef8a7f",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/12/2026 10:38:17",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "77977861-d855-4e62-b2f6-f2696464477d",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/14/2026 16:39:03",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b3961413-5be9-4016-af9a-bab0a09bdddd",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/14/2026 19:39:54",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cf75e2bc-1f4d-442f-b607-f1b9a6890509",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/14/2026 19:57:34",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8498ba09-c7bf-42e8-9033-53ea190e0d77",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/14/2026 20:06:12",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "0b48caa5-32af-4f2a-8fee-47ecda50b568",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/14/2026 20:06:16",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "e2357120-aa65-48bf-8aed-16c4abb5869e",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/14/2026 20:42:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6d4dc805-1663-4388-854f-596b9cfc372e",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/14/2026 20:52:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b2d8fcb3-4b5b-4268-91a1-e9493f632d8f",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "9/14/2026 20:58:23",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "80cf97b3-760d-4bca-9421-98308cbf4c61",
    "empId": "836",
    "type": "Shift Start",
    "timestamp": "9/14/2026 20:59:15",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4bcf6458-ba91-4e14-90ec-b93fcdf936c9",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/14/2026 21:08:18",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "bf8dfaae-2dbd-4959-b552-8fdb09021208",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/14/2026 21:14:10",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "025c1d28-e440-4fd8-9486-5eca54ed92f7",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/14/2026 22:16:09",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a53601a4-ac8b-45d3-ab2f-452791b28019",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/14/2026 22:23:29",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "5c94e41b-419b-47d3-9fac-74514a512179",
    "empId": "2610",
    "type": "Break 1 Start",
    "timestamp": "9/14/2026 22:46:15",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1c09e161-d79e-4aa1-97c3-c393f2ebe67c",
    "empId": "2298",
    "type": "Break 1 Start",
    "timestamp": "9/14/2026 22:46:49",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0221bf05-f74a-435e-bcf7-948098dba14d",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/14/2026 22:55:53",
    "duration": "39.73",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0df1c556-69d2-4ebe-a588-ae466c18a9c9",
    "empId": "2610",
    "type": "Break 1 End",
    "timestamp": "9/14/2026 22:58:55",
    "duration": "12.67",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e9ea0ec7-3e56-4474-8428-bfe059be4b91",
    "empId": "2298",
    "type": "Break 1 End",
    "timestamp": "9/14/2026 22:58:56",
    "duration": "12.12",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "524bb219-a88e-454e-8ff4-e9f73d0ef4d4",
    "empId": "1880",
    "type": "Break 1 Start",
    "timestamp": "9/14/2026 23:04:25",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "aa9f9460-6eaf-4a51-bc00-5b90bcab82e6",
    "empId": "1880",
    "type": "Break 1 End",
    "timestamp": "9/14/2026 23:08:08",
    "duration": "3.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "46f763c0-4653-4f24-ab49-d88e626826c7",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/14/2026 23:17:19",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "49207eea-4c67-47eb-a28d-676d1793cd35",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/14/2026 23:18:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "80844aa6-7469-490d-a8fc-b4506d563eab",
    "empId": "836",
    "type": "Break 1 Start",
    "timestamp": "9/14/2026 23:18:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ea4f5498-e171-4e2b-9a57-484e804900ca",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/14/2026 23:25:44",
    "duration": "8.42",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ebd14690-6fbb-4f6b-8ca6-915bfe868fde",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/14/2026 23:34:01",
    "duration": "15.53",
    "status": "Overbreak",
    "overDuration": "0.53"
  },
  {
    "id": "0537ffee-4e5a-4092-a389-101f18e44f73",
    "empId": "836",
    "type": "Break 1 End",
    "timestamp": "9/14/2026 23:34:17",
    "duration": "15.3",
    "status": "Overbreak",
    "overDuration": "0.3"
  },
  {
    "id": "daef2a9a-3bcb-4ba3-a0a4-e931a30336ca",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 0:01:14",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "683775c4-f60a-4571-ab67-025a103642db",
    "empId": "2298",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 0:03:24",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "09da353c-47db-43d4-b7d7-4ef737ca4495",
    "empId": "2298",
    "type": "End Lunch",
    "timestamp": "9/15/2026 0:58:27",
    "duration": "55.05",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "22796033-316f-4e30-907c-989ecfd4811a",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/15/2026 1:00:38",
    "duration": "59.4",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4d525944-827e-46a2-9e22-b5b989c6cbbc",
    "empId": "1035",
    "type": "Break 1 Start",
    "timestamp": "9/15/2026 1:05:05",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3c3d9857-61b5-4d5d-8c19-813f49f857b6",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 1:11:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "643e11e3-4969-4d4b-a720-6a04930aaf2f",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 1:12:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4d5f137d-bb66-4ac2-81d2-d6f4d689e3ea",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/15/2026 1:31:49",
    "duration": "19.68",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4bccc00c-13fd-4918-aa9a-82f856a9e7d5",
    "empId": "1035",
    "type": "Break 1 End",
    "timestamp": "9/15/2026 1:42:49",
    "duration": "37.73",
    "status": "Overbreak",
    "overDuration": "22.73"
  },
  {
    "id": "0dbc5022-27d2-4258-9a62-b2fd7168ecc5",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 1:50:41",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "df45b4ad-4ed9-43f3-9237-2177891e10a3",
    "empId": "836",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 1:55:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d634ff4c-4b56-4371-9136-3182add987db",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 1:57:09",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "baca5a6b-65d5-4ce8-b1f8-49b721cd1c6b",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/15/2026 2:01:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a63722f5-7543-41c9-b22f-b4bc2605c633",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 2:02:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3fa4db8d-1047-4a71-9ba5-9108a477289e",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/15/2026 2:09:34",
    "duration": "57.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "55284122-9b30-4c03-82a4-5c24af5dff2a",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "9/15/2026 2:36:39",
    "duration": "45.97",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6281be4c-3553-44e3-9902-76e588af5699",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 2:42:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cfc1a07d-27fb-47af-a298-33efd05721d9",
    "empId": "836",
    "type": "End Lunch",
    "timestamp": "9/15/2026 2:42:14",
    "duration": "46.72",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f3848da4-f64e-4eb7-bc58-41933ab29c1c",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "9/15/2026 2:51:48",
    "duration": "54.65",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "74b14050-4d9b-4b1d-9deb-49bcb708b121",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/15/2026 3:21:55",
    "duration": "79.82",
    "status": "Overlunch",
    "overDuration": "19.82"
  },
  {
    "id": "07a46428-972b-4b8c-8eef-8c0d0f2d9cec",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/15/2026 3:40:28",
    "duration": "58.45",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "da9560b8-3c05-49ec-a182-d28803028dec",
    "empId": "2610",
    "type": "Break 2 Start",
    "timestamp": "9/15/2026 4:16:10",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f63d5985-23ca-4869-8959-e45479a8ceea",
    "empId": "946",
    "type": "Break 1 Start",
    "timestamp": "9/15/2026 4:25:19",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "9ae42bbd-3a0c-40ba-b84d-0793b161d30f",
    "empId": "836",
    "type": "Break 2 Start",
    "timestamp": "9/15/2026 4:31:59",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d3ee3f59-b19c-4b71-a54d-db969570f7db",
    "empId": "2610",
    "type": "Break 2 End",
    "timestamp": "9/15/2026 4:32:36",
    "duration": "16.43",
    "status": "Overbreak",
    "overDuration": "1.43"
  },
  {
    "id": "5e07d990-ed31-41a7-bc4a-03353c82eb2a",
    "empId": "946",
    "type": "Break 1 End",
    "timestamp": "9/15/2026 4:38:26",
    "duration": "13.12",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2401ba0a-6cc4-4617-857a-e60349039539",
    "empId": "836",
    "type": "Break 2 End",
    "timestamp": "9/15/2026 4:42:21",
    "duration": "10.37",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6fa9b719-9a70-43c0-9439-e04cacc5d0cb",
    "empId": "1772",
    "type": "Break 2 Start",
    "timestamp": "9/15/2026 4:52:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a061a5ff-9c68-47e6-b8a6-87752866bf83",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/15/2026 5:02:39",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "dfdd6094-9e28-4018-aa72-f384e57c08a3",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/15/2026 5:04:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bd1636a0-8e2a-4e73-b042-cf151115af31",
    "empId": "1772",
    "type": "Break 2 End",
    "timestamp": "9/15/2026 5:06:36",
    "duration": "13.75",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c52c5b47-c123-42c6-bb67-9792372fe115",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "9/15/2026 6:00:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "11f3b25b-5e9d-44fd-80c3-d6e968e1d0d1",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/15/2026 6:01:00",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3805435c-11ea-4068-ae0d-0e55f515cb7a",
    "empId": "836",
    "type": "Shift End",
    "timestamp": "9/15/2026 6:01:48",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f7006301-fac6-49fb-be40-aca1ad8d541b",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/15/2026 6:04:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "24c61c45-2b09-4d56-b031-242f88b86351",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/15/2026 6:08:11",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ae5ba7c2-74c3-4c34-94f1-a1cb33f141d5",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/15/2026 6:12:18",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bb4af475-03e8-4ceb-be73-15c697760a7b",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/15/2026 6:13:36",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "961ee6b7-cb28-4d89-8dae-05a9f08e2438",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/15/2026 7:00:35",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "70f932e9-f7b2-480e-b5a0-4397b86e4303",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/15/2026 7:00:38",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7fd87c8e-90dd-4815-9b5b-143159ac82e5",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/15/2026 11:15:52",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "44700a29-bfa2-4290-b921-b7fd926cd3dc",
    "empId": "1820",
    "type": "Break 1 Start",
    "timestamp": "9/15/2026 14:38:19",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ebfa935c-b4aa-419d-854b-f2bdec8c1a9a",
    "empId": "1820",
    "type": "Break 1 End",
    "timestamp": "9/15/2026 14:51:47",
    "duration": "13.47",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "6374dea9-1b7f-4ec3-86e1-25380822856a",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/15/2026 16:56:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "abf9d1b5-b65a-4d23-b83b-bd8287c795b4",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/15/2026 18:50:08",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "be318b2f-4806-4e09-b51a-60dd901e914d",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/15/2026 20:04:08",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "e8f8771a-0871-4986-930d-c47d3a927570",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 20:07:40",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "aa7fd851-e6ce-4f96-8462-70eadf5103b4",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/15/2026 20:08:30",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "95ade8a2-5a33-4690-a599-61c583c598cf",
    "empId": "1880",
    "type": "Shift Start",
    "timestamp": "9/15/2026 20:40:01",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4e0764b5-c75e-4c74-a44e-0cc88f00962f",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "9/15/2026 20:40:21",
    "duration": "32.68",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "c1c23747-c24d-4a99-ab84-90ba5cb542b6",
    "empId": "836",
    "type": "Shift Start",
    "timestamp": "9/15/2026 20:41:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2059dad8-72c2-434b-836f-b1451b5bcac1",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "9/15/2026 20:58:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f8e912b0-ea40-4ab5-9035-89117645ee71",
    "empId": "946",
    "type": "Shift Start",
    "timestamp": "9/15/2026 21:02:51",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "b1effbfb-78ff-4c71-84f9-ea77ed1c3826",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/15/2026 21:04:41",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "87358abd-d028-4766-aaec-a8f4e8786053",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/15/2026 21:12:32",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "6ef6c3ae-7206-4737-a085-b32d17aedbd2",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/15/2026 21:52:45",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "92784729-5a86-4c7a-9c0c-a3f2e655645b",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/15/2026 22:03:43",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "cfc48a41-6095-4885-90be-f713538a8407",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/15/2026 22:18:47",
    "duration": "26.03",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0277a529-88d2-4c97-97d1-d89faa641e9a",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/15/2026 23:10:28",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ffcf8b7c-03a3-4672-86bc-82633e6ed2e8",
    "empId": "1880",
    "type": "Break 1 Start",
    "timestamp": "9/15/2026 23:14:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "224d0455-d90f-44f5-86a2-0159866063a9",
    "empId": "1880",
    "type": "Break 1 End",
    "timestamp": "9/15/2026 23:18:05",
    "duration": "3.15",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "21032323-6578-4ae2-be83-4ccdc1d347f7",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/15/2026 23:20:04",
    "duration": "9.6",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d9a3390b-3b6d-4e58-85ab-68f47d0cf61a",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 0:00:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3aeaaf54-7746-4d8f-9bce-57b527021133",
    "empId": "2298",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 0:00:53",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "77070873-98f9-44e3-8173-aee4e0002226",
    "empId": "2298",
    "type": "End Lunch",
    "timestamp": "9/16/2026 0:57:56",
    "duration": "57.05",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e1c45f9e-49c1-4c18-bb3a-64aaaa971625",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/16/2026 0:58:28",
    "duration": "57.62",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "198678bf-d732-47fb-b85d-4fc9c50cc04e",
    "empId": "1880",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 1:05:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2fc03677-f962-4091-8fbb-bf1b2bd3da36",
    "empId": "946",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 1:10:39",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4a13220b-1743-447e-b59b-1e58b7569b06",
    "empId": "1880",
    "type": "End Lunch",
    "timestamp": "9/16/2026 1:52:08",
    "duration": "47.03",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "ff077d88-cca3-42a0-9264-fc887cfcc895",
    "empId": "2385",
    "type": "Shift End",
    "timestamp": "9/16/2026 2:01:29",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "058c2272-e4ae-468f-81a7-ec25f2cbd991",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/16/2026 2:02:21",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "474de20b-1773-47be-8f25-3d6f4dcc0da8",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 2:02:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b70f01cd-b9a6-41f1-bd7e-6380a1790897",
    "empId": "1035",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 2:02:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1a5c0b8e-6183-47b1-a9bc-053d0d642b06",
    "empId": "946",
    "type": "End Lunch",
    "timestamp": "9/16/2026 2:04:44",
    "duration": "54.08",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "671c8fc9-8ed5-46e8-b125-b01762813aac",
    "empId": "1597",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 2:26:50",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f02959d8-9a78-4e38-9438-6a488a020101",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 2:43:38",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e52c799b-f6f6-4bc1-b638-d2bd462bf35d",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "9/16/2026 2:44:11",
    "duration": "41.73",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "bbfa3405-de90-430f-b9cf-54d78de5b82d",
    "empId": "1035",
    "type": "End Lunch",
    "timestamp": "9/16/2026 3:00:58",
    "duration": "58.03",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e8610b09-e9f8-48b1-9a52-1dfc5d6ad8dc",
    "empId": "1597",
    "type": "End Lunch",
    "timestamp": "9/16/2026 3:24:37",
    "duration": "57.78",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cfddf012-4584-4249-9a8c-9a260f2294cf",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/16/2026 3:25:16",
    "duration": "41.63",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "850d7975-5485-4a7e-97c1-d1ba499e4481",
    "empId": "1880",
    "type": "Break 2 Start",
    "timestamp": "9/16/2026 4:04:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a37676bf-3f9a-4317-be24-45c0963e2fcd",
    "empId": "1880",
    "type": "Break 2 End",
    "timestamp": "9/16/2026 4:17:33",
    "duration": "12.63",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "41f85e3b-141c-4218-8df8-2f51cc596e47",
    "empId": "1772",
    "type": "Break 2 Start",
    "timestamp": "9/16/2026 4:50:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a77f1d5c-3625-42fe-9956-c9ea64459f34",
    "empId": "1772",
    "type": "Break 2 End",
    "timestamp": "9/16/2026 5:03:28",
    "duration": "12.92",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cc829b1e-7fb2-4a3b-9df9-a5c0c1e13466",
    "empId": "2298",
    "type": "Shift End",
    "timestamp": "9/16/2026 5:03:33",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "510a25f9-4211-4cc2-89cc-7877e1fce2aa",
    "empId": "1006",
    "type": "Shift End",
    "timestamp": "9/16/2026 6:00:58",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7a1089aa-a68f-4655-9bec-db4c9080a48a",
    "empId": "1597",
    "type": "Shift End",
    "timestamp": "9/16/2026 6:04:27",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "a7459f59-b336-41d6-9ddc-21cdfc224715",
    "empId": "946",
    "type": "Shift End",
    "timestamp": "9/16/2026 6:05:50",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b26ba28d-1b0b-417c-88fc-e64ed43984fb",
    "empId": "836",
    "type": "Shift End",
    "timestamp": "9/16/2026 6:06:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "aceb926b-ae72-4fb2-8214-f87a4100fb69",
    "empId": "1880",
    "type": "Shift End",
    "timestamp": "9/16/2026 6:10:31",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d7002baa-6741-46c9-a2c6-c3beccaec9fd",
    "empId": "1772",
    "type": "Shift End",
    "timestamp": "9/16/2026 6:11:06",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "e8429991-f143-4daf-bd2d-5636c281c9a8",
    "empId": "1035",
    "type": "Shift End",
    "timestamp": "9/16/2026 7:01:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "34df3c1e-3bb6-49dc-b18a-d1db929e56f2",
    "empId": "1820",
    "type": "Shift Start",
    "timestamp": "9/16/2026 10:51:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "b430b699-a170-46f7-9bc1-bd0be01fe312",
    "empId": "1820",
    "type": "Break 1 Start",
    "timestamp": "9/16/2026 13:08:38",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4b95c9bb-ff01-40d4-aee9-78cf74c542e1",
    "empId": "1820",
    "type": "Break 1 End",
    "timestamp": "9/16/2026 13:29:44",
    "duration": "21.1",
    "status": "Overbreak",
    "overDuration": "6.1"
  },
  {
    "id": "2bca1610-85d0-411f-af81-8775c56ad793",
    "empId": "2385",
    "type": "Shift Start",
    "timestamp": "9/16/2026 16:57:46",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "04e2d507-eeda-411d-a940-8a8450e23666",
    "empId": "1820",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 18:12:26",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "064bb4ab-dd25-4650-ba8f-1e682e47bab2",
    "empId": "1820",
    "type": "End Lunch",
    "timestamp": "9/16/2026 19:01:02",
    "duration": "48.6",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "75c115c0-d0df-4e31-9fc4-ab12a8a2826e",
    "empId": "2298",
    "type": "Shift Start",
    "timestamp": "9/16/2026 19:59:49",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "7be581a1-5776-432f-a7dd-5e133669ef8b",
    "empId": "1820",
    "type": "Shift End",
    "timestamp": "9/16/2026 20:03:00",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "04d2c56e-568f-400a-8322-7053afa7a1f9",
    "empId": "2610",
    "type": "Shift End",
    "timestamp": "9/16/2026 20:05:44",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "1d70cfea-b7fd-4760-aedd-c539ee8a8ff9",
    "empId": "2610",
    "type": "Shift Start",
    "timestamp": "9/16/2026 20:05:48",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "0d815a5a-be98-49c2-9502-5c3b776c1fda",
    "empId": "1006",
    "type": "Shift Start",
    "timestamp": "9/16/2026 20:44:44",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "72a92775-3ce8-4fba-9a7f-d9d817596a4e",
    "empId": "836",
    "type": "Shift Start",
    "timestamp": "9/16/2026 20:52:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "5d8172b5-6a52-43d7-b36f-759fe2f14919",
    "empId": "1772",
    "type": "Shift Start",
    "timestamp": "9/16/2026 20:58:56",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "f71cb5fc-e06f-40c7-8fc3-6cbd60f135a1",
    "empId": "1597",
    "type": "Shift Start",
    "timestamp": "9/16/2026 21:07:33",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "49ef540e-6048-438e-9df5-a236eb447176",
    "empId": "1954",
    "type": "Shift End",
    "timestamp": "9/16/2026 21:38:48",
    "duration": "N/A",
    "status": "Undertime",
    "overDuration": null
  },
  {
    "id": "0581a48b-71b1-42e6-bc94-5b023ca8ba32",
    "empId": "1954",
    "type": "Shift Start",
    "timestamp": "9/16/2026 21:39:04",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "f477fe58-3517-4554-a95d-10d014583bba",
    "empId": "2385",
    "type": "Start Lunch",
    "timestamp": "9/16/2026 21:54:35",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "2447af37-6b3e-4bf0-87bf-f0277298cec2",
    "empId": "1772",
    "type": "Break 1 Start",
    "timestamp": "9/16/2026 22:49:57",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "52288250-6adf-48b8-81ff-b63c577800cb",
    "empId": "2385",
    "type": "End Lunch",
    "timestamp": "9/16/2026 22:54:50",
    "duration": "60.25",
    "status": "Overlunch",
    "overDuration": "0.25"
  },
  {
    "id": "fc500972-1ab5-41b1-91cd-5a155435656e",
    "empId": "1772",
    "type": "Break 1 End",
    "timestamp": "9/16/2026 23:01:49",
    "duration": "11.87",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d826d4c3-3189-4209-97ec-d0e3cd3a3cd2",
    "empId": "2610",
    "type": "Break 1 Start",
    "timestamp": "9/16/2026 23:04:07",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3ba95ac3-4cee-40e0-9a5b-c1f284cd4458",
    "empId": "2610",
    "type": "Break 1 End",
    "timestamp": "9/16/2026 23:17:53",
    "duration": "13.77",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "887252a1-d45c-4d94-842c-b01b3de0786f",
    "empId": "836",
    "type": "Break 1 Start",
    "timestamp": "9/16/2026 23:21:30",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4117232d-c76a-4072-a216-d8cab12b3374",
    "empId": "836",
    "type": "Break 1 End",
    "timestamp": "9/16/2026 23:34:10",
    "duration": "12.67",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "25b656fd-f080-4a1f-8d7b-57d6d9081af4",
    "empId": "1597",
    "type": "Break 1 Start",
    "timestamp": "9/16/2026 23:34:16",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "1901660a-2de5-447b-925c-1bebd1ba5fb6",
    "empId": "1597",
    "type": "Break 1 End",
    "timestamp": "9/16/2026 23:46:43",
    "duration": "12.45",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "db88d921-a43c-4c15-8145-96d1c4bf3225",
    "empId": "2610",
    "type": "Start Lunch",
    "timestamp": "9/17/2026 0:01:22",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "3958bfa3-1d03-43a7-b660-55347ae997a8",
    "empId": "2298",
    "type": "Start Lunch",
    "timestamp": "9/17/2026 0:42:42",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "64ab86a0-e237-4beb-be5d-cceb15c2fbe9",
    "empId": "2610",
    "type": "End Lunch",
    "timestamp": "9/17/2026 0:59:37",
    "duration": "58.25",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "cff7aeaa-95f6-4bd2-bc04-5b7a49c09271",
    "empId": "2298",
    "type": "End Lunch",
    "timestamp": "9/17/2026 1:40:28",
    "duration": "57.77",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "848e7d67-1176-4c98-a0d7-a0209ee24e4b",
    "empId": "1772",
    "type": "Start Lunch",
    "timestamp": "9/17/2026 2:17:32",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "0228b87a-0302-4360-985f-7e3305d8eba0",
    "empId": "836",
    "type": "Start Lunch",
    "timestamp": "9/17/2026 2:21:55",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8f441a66-54d8-4a0b-994e-be7a860c3f7a",
    "empId": "1035",
    "type": "Shift Start",
    "timestamp": "9/17/2026 2:40:53",
    "duration": "N/A",
    "status": "Late",
    "overDuration": null
  },
  {
    "id": "5773fb76-0962-41ba-bfb5-803cf3f2bd02",
    "empId": "1006",
    "type": "Start Lunch",
    "timestamp": "9/17/2026 2:44:37",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8ce37d8f-87e4-4f14-bef7-6eee4b66692e",
    "empId": "1035",
    "type": "Break 1 Start",
    "timestamp": "9/17/2026 2:56:14",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "95d1fd40-a8e9-4fd4-a018-48698043a781",
    "empId": "1035",
    "type": "Break 1 End",
    "timestamp": "9/17/2026 3:08:50",
    "duration": "12.6",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "4a8bc44f-0ec7-4e98-8f11-f78a01dd75f0",
    "empId": "1772",
    "type": "End Lunch",
    "timestamp": "9/17/2026 3:15:18",
    "duration": "57.77",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "8ee63356-0767-49f5-9ea4-559a31bc7ceb",
    "empId": "836",
    "type": "End Lunch",
    "timestamp": "9/17/2026 3:22:26",
    "duration": "60.52",
    "status": "Overlunch",
    "overDuration": "0.52"
  },
  {
    "id": "8224895a-d21d-46fb-9f71-c3b91f8b180c",
    "empId": "1006",
    "type": "End Lunch",
    "timestamp": "9/17/2026 3:31:41",
    "duration": "47.07",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "d672d189-ec65-4c92-9d5d-1bc207a93191",
    "empId": "2298",
    "type": "Break 1 Start",
    "timestamp": "9/17/2026 3:36:41",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "99d7af6e-c070-4c35-8cb5-1a9d3348a1a2",
    "empId": "2298",
    "type": "Break 1 End",
    "timestamp": "9/17/2026 3:36:47",
    "duration": "0.1",
    "status": "On Time",
    "overDuration": null
  },
  {
    "id": "67906624-a986-4038-b47d-ae2603907645",
    "empId": "2298",
    "type": "Break 2 Start",
    "timestamp": "9/17/2026 3:36:51",
    "duration": "N/A",
    "status": "On Time",
    "overDuration": null
  }
];

export function getEmployeePunches(empId: string, punchList: PunchLogItem[] = INITIAL_PUNCH_LOGS): PunchLogItem[] {
  return punchList
    .filter(p => String(p.empId) === String(empId))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getLatestPunch(empId: string, punchList: PunchLogItem[] = INITIAL_PUNCH_LOGS): PunchLogItem | null {
  const list = getEmployeePunches(empId, punchList);
  return list.length > 0 ? list[0] : null;
}

export interface ComputedPunchStatus {
  status: 'working' | 'lunch' | 'break_1' | 'break_2' | 'offline';
  statusLabel: string;
  lastPunchType: string;
  lastPunchTime: string;
  lastPunchTimestamp: string;
  elapsedSeconds: number;
  punchesState: ShiftPunchesState;
}

export function computeEmployeePunchStatus(
  empId: string,
  punchList: PunchLogItem[] = INITIAL_PUNCH_LOGS
): ComputedPunchStatus {
  const latest = getLatestPunch(empId, punchList);
  const employeePunches = getEmployeePunches(empId, punchList);

  // Find punches for active shift session
  const shiftStartPunch = employeePunches.find(p => p.type.toLowerCase().includes('shift start'));
  const shiftStartTime = shiftStartPunch ? new Date(shiftStartPunch.timestamp).getTime() : 0;
  
  const currentShiftPunches = employeePunches.filter(p => {
    if (!shiftStartTime) return true;
    const pTime = new Date(p.timestamp).getTime();
    return pTime >= shiftStartTime - 1000 * 60 * 30;
  });

  const punchesState: ShiftPunchesState = {
    hasShiftStart: currentShiftPunches.some(p => p.type.toLowerCase().includes('shift start')),
    hasBreak1Start: currentShiftPunches.some(p => p.type.toLowerCase().includes('break 1 start') || (p.type.toLowerCase().includes('start break') && !p.type.toLowerCase().includes('2'))),
    hasBreak1End: currentShiftPunches.some(p => p.type.toLowerCase().includes('break 1 end') || (p.type.toLowerCase().includes('end break') && !p.type.toLowerCase().includes('2'))),
    hasLunchStart: currentShiftPunches.some(p => p.type.toLowerCase().includes('start lunch') || (p.type.toLowerCase().includes('lunch') && !p.type.toLowerCase().includes('end'))),
    hasLunchEnd: currentShiftPunches.some(p => p.type.toLowerCase().includes('end lunch')),
    hasBreak2Start: currentShiftPunches.some(p => p.type.toLowerCase().includes('break 2 start')),
    hasBreak2End: currentShiftPunches.some(p => p.type.toLowerCase().includes('break 2 end')),
    hasShiftEnd: currentShiftPunches.some(p => p.type.toLowerCase().includes('shift end')),
  };

  if (!latest) {
    return {
      status: 'offline',
      statusLabel: 'Offline',
      lastPunchType: 'None',
      lastPunchTime: '--:--',
      lastPunchTimestamp: '',
      elapsedSeconds: 0,
      punchesState,
    };
  }

  const punchDate = new Date(latest.timestamp);
  const isValidDate = !isNaN(punchDate.getTime());
  const now = new Date();
  const elapsed = isValidDate ? Math.max(0, Math.floor((now.getTime() - punchDate.getTime()) / 1000)) : 0;
  
  let formattedTime = latest.timestamp;
  if (isValidDate) {
    formattedTime = punchDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  }

  const typeLower = latest.type.toLowerCase();

  if (typeLower.includes('start lunch') || (typeLower.includes('lunch') && !typeLower.includes('end'))) {
    return {
      status: 'lunch',
      statusLabel: 'On Lunch',
      lastPunchType: 'Start Lunch',
      lastPunchTime: formattedTime,
      lastPunchTimestamp: latest.timestamp,
      elapsedSeconds: elapsed,
      punchesState,
    };
  }

  if (typeLower.includes('break 2 start')) {
    return {
      status: 'break_2',
      statusLabel: 'On 2nd Break',
      lastPunchType: 'Break 2 Start',
      lastPunchTime: formattedTime,
      lastPunchTimestamp: latest.timestamp,
      elapsedSeconds: elapsed,
      punchesState,
    };
  }

  if (typeLower.includes('start break') || typeLower.includes('break 1 start') || (typeLower.includes('break') && !typeLower.includes('end'))) {
    return {
      status: 'break_1',
      statusLabel: 'On 1st Break',
      lastPunchType: 'Break 1 Start',
      lastPunchTime: formattedTime,
      lastPunchTimestamp: latest.timestamp,
      elapsedSeconds: elapsed,
      punchesState,
    };
  }

  if (typeLower.includes('shift end') || typeLower.includes('punch out')) {
    return {
      status: 'offline',
      statusLabel: 'Shift Ended',
      lastPunchType: 'Shift End',
      lastPunchTime: formattedTime,
      lastPunchTimestamp: latest.timestamp,
      elapsedSeconds: elapsed,
      punchesState,
    };
  }

  // Shift Start, End Lunch, Break 1 End, Break 2 End => Working
  return {
    status: 'working',
    statusLabel: 'Working',
    lastPunchType: latest.type,
    lastPunchTime: formattedTime,
    lastPunchTimestamp: latest.timestamp,
    elapsedSeconds: elapsed,
    punchesState,
  };
}

export function computeShiftMilestonesAndAudit(
  empId: string,
  punchList: PunchLogItem[] = INITIAL_PUNCH_LOGS,
  shiftSchedule: string = '9:00 PM to 6:00 AM'
): { milestones: ShiftMilestoneItem[]; auditHistory: PunchAuditEntry[] } {
  const employeePunches = getEmployeePunches(empId, punchList);

  const shiftStartPunch = employeePunches.find(p => p.type.toLowerCase().includes('shift start'));
  const shiftStartTime = shiftStartPunch ? new Date(shiftStartPunch.timestamp).getTime() : 0;

  const shiftPunches = employeePunches.filter(p => {
    if (!shiftStartTime) return true;
    const pTime = new Date(p.timestamp).getTime();
    return pTime >= shiftStartTime - 1000 * 60 * 30;
  });

  // 1. Shift Start
  const hasShiftStart = !!shiftStartPunch;
  const shiftStartFormatted = shiftStartPunch 
    ? new Date(shiftStartPunch.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
    : '9:00:00 PM';
  
  const m1: ShiftMilestoneItem = {
    id: 'm1',
    type: 'punch_in',
    label: 'Shift Start (Punch In)',
    timeRange: hasShiftStart ? shiftStartFormatted : 'Scheduled ~9:00 PM',
    duration: hasShiftStart ? (shiftStartPunch?.status === 'Late' ? 'Late Punch' : 'On Time') : 'Scheduled',
    status: hasShiftStart ? 'completed' : 'upcoming',
    iconName: 'LogIn',
    color: hasShiftStart ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  };

  // 2. 1st Break
  const break1Start = shiftPunches.find(p => p.type.toLowerCase().includes('break 1 start') || (p.type.toLowerCase().includes('start break') && !p.type.toLowerCase().includes('2')));
  const break1End = shiftPunches.find(p => p.type.toLowerCase().includes('break 1 end') || (p.type.toLowerCase().includes('end break') && !p.type.toLowerCase().includes('2')));
  
  let m2Status: 'completed' | 'active' | 'upcoming' = 'upcoming';
  let m2TimeRange = 'Scheduled ~11:30 PM';
  let m2Duration = '15 mins expected';
  let m2Color = 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';

  if (break1Start && break1End) {
    m2Status = 'completed';
    const sTime = new Date(break1Start.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const eTime = new Date(break1End.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    m2TimeRange = `${sTime} – ${eTime}`;
    m2Duration = break1End.duration !== 'N/A' ? `${Math.round(parseFloat(break1End.duration) || 15)} mins` : '15 mins';
    m2Color = 'bg-emerald-500 text-white';
  } else if (break1Start && !break1End) {
    m2Status = 'active';
    const sTime = new Date(break1Start.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    m2TimeRange = `${sTime} – In Progress`;
    m2Duration = 'Break in progress';
    m2Color = 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse';
  }

  const m2: ShiftMilestoneItem = {
    id: 'm2',
    type: 'break_1',
    label: '1st Paid Break (15m)',
    timeRange: m2TimeRange,
    duration: m2Duration,
    status: m2Status,
    iconName: 'Coffee',
    color: m2Color,
  };

  // 3. Lunch
  const lunchStart = shiftPunches.find(p => p.type.toLowerCase().includes('start lunch') || (p.type.toLowerCase().includes('lunch') && !p.type.toLowerCase().includes('end')));
  const lunchEnd = shiftPunches.find(p => p.type.toLowerCase().includes('end lunch'));

  let m3Status: 'completed' | 'active' | 'upcoming' = 'upcoming';
  let m3TimeRange = 'Scheduled ~1:00 AM';
  let m3Duration = '1h expected';
  let m3Color = 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';

  if (lunchStart && lunchEnd) {
    m3Status = 'completed';
    const sTime = new Date(lunchStart.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const eTime = new Date(lunchEnd.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    m3TimeRange = `${sTime} – ${eTime}`;
    m3Duration = lunchEnd.duration !== 'N/A' ? `${Math.round(parseFloat(lunchEnd.duration) || 55)} mins` : '55 mins';
    m3Color = 'bg-emerald-500 text-white';
  } else if (lunchStart && !lunchEnd) {
    m3Status = 'active';
    const sTime = new Date(lunchStart.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    m3TimeRange = `${sTime} – In Progress`;
    m3Duration = 'Elapsed in real-time';
    m3Color = 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse';
  }

  const m3: ShiftMilestoneItem = {
    id: 'm3',
    type: 'lunch',
    label: 'Meal / Lunch (1h)',
    timeRange: m3TimeRange,
    duration: m3Duration,
    status: m3Status,
    iconName: 'Utensils',
    color: m3Color,
  };

  // 4. 2nd Break
  const break2Start = shiftPunches.find(p => p.type.toLowerCase().includes('break 2 start') || (p.type.toLowerCase().includes('start break') && p !== break1Start));
  const break2End = shiftPunches.find(p => p.type.toLowerCase().includes('break 2 end') || (p.type.toLowerCase().includes('end break') && p !== break1End));

  let m4Status: 'completed' | 'active' | 'upcoming' = 'upcoming';
  let m4TimeRange = 'Scheduled ~4:00 AM';
  let m4Duration = '15 mins expected';
  let m4Color = 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';

  if (break2Start && break2End) {
    m4Status = 'completed';
    const sTime = new Date(break2Start.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const eTime = new Date(break2End.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    m4TimeRange = `${sTime} – ${eTime}`;
    m4Duration = break2End.duration !== 'N/A' ? `${Math.round(parseFloat(break2End.duration) || 15)} mins` : '15 mins';
    m4Color = 'bg-emerald-500 text-white';
  } else if (break2Start && !break2End) {
    m4Status = 'active';
    const sTime = new Date(break2Start.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    m4TimeRange = `${sTime} – In Progress`;
    m4Duration = 'Break in progress';
    m4Color = 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse';
  }

  const m4: ShiftMilestoneItem = {
    id: 'm4',
    type: 'break_2',
    label: '2nd Paid Break (15m)',
    timeRange: m4TimeRange,
    duration: m4Duration,
    status: m4Status,
    iconName: 'Coffee',
    color: m4Color,
  };

  // 5. Shift End
  const shiftEndPunch = shiftPunches.find(p => p.type.toLowerCase().includes('shift end'));
  const hasShiftEnd = !!shiftEndPunch;
  const shiftEndFormatted = shiftEndPunch 
    ? new Date(shiftEndPunch.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
    : 'Scheduled ~6:00 AM';

  // Calculate shift duration capped at 8.0 regular work hours (9.0 hrs total shift span)
  let shiftEndDuration = '9.0 hrs total shift';
  if (hasShiftEnd) {
    if (shiftStartPunch) {
      const startMs = new Date(shiftStartPunch.timestamp).getTime();
      const endMs = new Date(shiftEndPunch.timestamp).getTime();
      if (!isNaN(startMs) && !isNaN(endMs) && endMs > startMs) {
        const grossHours = (endMs - startMs) / (1000 * 3600);
        if (grossHours > 9.5) {
          // Forgotten punch-out auto-caps to regular 8.0 hours
          shiftEndDuration = '8.0 hrs regular (Auto-Capped)';
        } else {
          const netHours = Math.min(8.0, Math.max(0, grossHours - 1.0));
          shiftEndDuration = `${netHours.toFixed(1)} hrs completed`;
        }
      } else {
        shiftEndDuration = '8.0 hrs completed';
      }
    } else {
      shiftEndDuration = '8.0 hrs completed';
    }
  }

  const m5: ShiftMilestoneItem = {
    id: 'm5',
    type: 'punch_out',
    label: 'Shift End (Punch Out)',
    timeRange: shiftEndFormatted,
    duration: shiftEndDuration,
    status: hasShiftEnd ? 'completed' : 'upcoming',
    iconName: 'LogOut',
    color: hasShiftEnd ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  };

  const milestones = [m1, m2, m3, m4, m5];

  // Build Audit History Table Rows from real shift punches
  const auditHistory: PunchAuditEntry[] = shiftPunches.slice(0, 10).map((p) => {
    let action = p.type;
    let category = 'Shift Operations';
    const typeLower = p.type.toLowerCase();

    if (typeLower.includes('start lunch')) {
      category = 'Unpaid Meal Break';
      action = 'Start Lunch';
    } else if (typeLower.includes('end lunch')) {
      category = 'Unpaid Meal Break';
      action = 'End Lunch';
    } else if (typeLower.includes('break 1 start') || (typeLower.includes('start break') && !typeLower.includes('2'))) {
      category = 'Paid 1st Rest Period';
      action = 'Break 1 Start';
    } else if (typeLower.includes('break 1 end') || (typeLower.includes('end break') && !typeLower.includes('2'))) {
      category = 'Paid 1st Rest Period';
      action = 'Break 1 End';
    } else if (typeLower.includes('break 2 start')) {
      category = 'Paid 2nd Rest Period';
      action = 'Break 2 Start';
    } else if (typeLower.includes('break 2 end')) {
      category = 'Paid 2nd Rest Period';
      action = 'Break 2 End';
    } else if (typeLower.includes('shift start')) {
      category = 'Regular Work Hours';
      action = 'Shift Start';
    } else if (typeLower.includes('shift end')) {
      category = 'Regular Work Hours';
      action = 'Shift End';
    }

    const pDate = new Date(p.timestamp);
    const timeFormatted = !isNaN(pDate.getTime()) 
      ? pDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
      : p.timestamp;

    return {
      id: p.id,
      action,
      time: timeFormatted,
      duration: p.duration && p.duration !== 'N/A' ? `${p.duration}m` : 'Recorded',
      category,
      verifiedBy: 'Corporate Terminal / GeoSync',
      status: p.status,
    };
  });

  return { milestones, auditHistory };
}
