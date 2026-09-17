export type MeetingTime = {
  building: string | null;
  room: string | null;
  beginTime: string;
  endTime: string;
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  startDate: string;
  endDate: string;
};

export type Meeting = {
  meetingTime: MeetingTime;
};

export type Section = {
  subject: string;
  courseNumber: string;
  sequenceNumber: string;
  meetingsFaculty: Meeting[];
};

export type ScheduleResponse = {
  term: string;
  shortTerm: string;
  status: string;
  semesterEnd: string;
  data: Section[];
  error?: string;
};

export type RoomMeeting = {
  subject: string;
  courseNumber: string;
  section: string;
  meetingTime: MeetingTime;
};
