export const enum NotificationTypes {
  fileDownloadStart = "fileDownloadStart",
  fileDownloadComplete = "fileDownloadComplete"
}

export interface ShowNotificationParameters {
  message: string;
  notificationType: NotificationTypes;
}
