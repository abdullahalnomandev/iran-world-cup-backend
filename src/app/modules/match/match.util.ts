import admin from '../../../helpers/firebaseConfig';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';

const pushNotificationToAllUsers = async (isGoal: boolean) => {
  if (!isGoal) {
    return;
  }
  const users = await User.find({});
  await Promise.allSettled(
    users
      .filter(user => (user as IUser)?.fcmToken)
      .map(user =>
        admin.messaging().send({
          token: (user as IUser)?.fcmToken!,
          notification: {
            title: 'New Goal!',
            body: 'Goal scored!',
          },
          data: {
            roomId: 'goal',
            content: 'Goal scored!',
          },
        }),
      ),
  );
};

export { pushNotificationToAllUsers };
