import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { defaultPubsubTopic, newNode, start, isStarted, stop, peerID, relayEnoughPeers, listenAddresses, connect, peerCnt, peers, relayPublish, relayUnsubscribe, relaySubscribe, WakuMessage, onMessage, StoreQuery, storeQuery, Config, FilterSubscription, ContentFilter, filterSubscribe} from '@waku/react-native';

export default function App() {
  const [result, setResult] = React.useState<string | undefined>();

  React.useEffect(() => {
    (async () => {
      const nodeStarted = await isStarted();

      if (!nodeStarted) {
        await newNode(null);
        await start();
      }
      console.log("The node ID:", await peerID())

      await relaySubscribe()

      onMessage(event => {
        console.log("Message Received: ", event)
      })

      console.log("enoughPeers?", await relayEnoughPeers())
      console.log("addresses", await listenAddresses())
      console.log("connecting...")
      
      await connect("/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/30303/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm", 5000)
      await connect("/dns4/node-01.do-ams3.wakuv2.test.statusim.net/tcp/30303/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ", 5000)

      console.log("connected!") 

      console.log("PeerCNT", await peerCnt())
      console.log("Peers", await peers())

      let msg: WakuMessage = new WakuMessage()
      msg.contentTopic = "ABC"
      msg.payload = new Uint8Array([1, 2, 3, 4, 5])
      msg.timestamp = Date.now();
      msg.version = 0;

      let messageID = await relayPublish(msg);

      console.log("The messageID", messageID)

      
      // TO RETRIEVE HISTORIC MESSAGES:
      console.log("Retrieving messages from store node")
      const query = new StoreQuery();
      query.contentFilters.push(new ContentFilter("/toy-chat/2/luzhou/proto"))
      const queryResult = await storeQuery(query, "16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm")
      console.log(queryResult)
      
      // USING FILTER INSTEAD OF RELAY:
      // Instantiate the node passing these parameters:
      // let config = new Config();
      // config.relay = false;
      // config.filter = true;
      // newNode(config})
      /*
      const filterSubs = new FilterSubscription();
      filterSubs.contentFilters.push(new ContentFilter("/toy-chat/2/luzhou/proto"))
      await filterSubscribe(filterSubs, "16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm")
      */


   

      // console.log("Unsubscribing and stopping node...")

      // await relayUnsubscribe();
    
      // await stop(); // TODO: This must be called only once
    })();

    defaultPubsubTopic().then(setResult);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
