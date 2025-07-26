import { eventStream } from 'remix-utils/sse/server';
import type { Route } from './+types/stream-links';
import { authSession } from '~/auth/session.server';
import { redisChannelNames } from '~/lib/redis-channels.server';
import { subscriptionClient } from '~/db/redis.server';
import ms from 'ms';
import { throttle } from '~/lib/utils';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authSession.require(request);
  const channel = redisChannelNames.linkUpdate(user.id);

  return eventStream(request.signal, (send) => {
    subscriptionClient.subscribe(channel, (err, count) => {
      if (err) console.error('Subscribe error', err);
      else console.log(`Subscribed to ${channel} (count=${count})`);
    });

    const listener = () => {
      send({ event: 'linkUpdate', data: Date.now().toString() });
    };

    const throttledListener = throttle(listener, 377);

    subscriptionClient.on('message', throttledListener);

    const intervalId = setInterval(() => {
      send({ event: 'ping', data: Date.now().toString() });
    }, ms('20s'));

    return () => {
      subscriptionClient.unsubscribe(channel, (err, count) => {
        if (err) console.error('Unsubscribe error', err);
        else console.log(`Unsubscribed from ${channel} (count=${count})`);
      });
      subscriptionClient.off('message', throttledListener);
      clearInterval(intervalId);
    };
  });
}
