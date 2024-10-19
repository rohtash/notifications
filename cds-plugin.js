const cds = require("@sap/cds");
const { copy, exists, path } = cds.utils

cds.build?.register?.('notifications', class NotificationsBuildPlugin extends cds.build.Plugin {
  static taskDefaults = { src: cds.env.folders.srv }

  static hasTask() {
    const notificationTypesFile = cds.env.requires?.notifications?.types;
    return notificationTypesFile === undefined ? false : exists(notificationTypesFile);
  }

  async build() {
    if (exists(cds.env.requires.notifications?.types)) {
      const fileName = path.basename(cds.env.requires.notifications.types);
      await copy(cds.env.requires.notifications.types).to(path.join(this.task.dest, fileName));
    }
  }
});


cds.once("served", async () => {
  const { validateNotificationTypes, readFile } = require("./lib/utils");
  const { createNotificationTypesMap } = require("./lib/notificationTypes");
  const production = cds.env.profiles?.includes("production");

  // read notification types
  const notificationTypes = readFile(cds.env.requires?.notifications?.types);
  if (validateNotificationTypes(notificationTypes)) {
    if (!production) {
      const notificationTypesMap = createNotificationTypesMap(notificationTypes, true);
      cds.notifications = { local: { types: notificationTypesMap } };
    }
  }

  require("@sap-cloud-sdk/util").setGlobalLogLevel("error")
})
