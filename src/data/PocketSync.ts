import { Notice } from "obsidian";
import { AccessTokenResponse, PocketAPI } from "../pocket_api/PocketAPI";
import { AccessInfo } from "../pocket_api/PocketAuth";
import { MetadataStore } from "./MetadataStore";
import { PocketItemStore } from "./PocketItemStore";

export const doPocketSync = async (
  itemStore: PocketItemStore,
  metadataStore: MetadataStore,
  pocketAPI: PocketAPI,
  accessInfo: AccessInfo,
  pocketSyncTags?: string[] | null
) => {
  const lastUpdateTimestamp = await metadataStore.getLastUpdateTimestamp();

  new Notice(`Fetching Pocket updates for ${accessInfo.username}`);

  if(pocketSyncTags) {
    for (const pocketSyncTag of pocketSyncTags) {
      await get(pocketAPI, accessInfo, lastUpdateTimestamp, pocketSyncTag, itemStore, metadataStore);
    }
  }
  else {
    await get(pocketAPI, accessInfo, lastUpdateTimestamp, null, itemStore, metadataStore);
  }

  new Notice(`Done storing updates from Pocket`);
};

async function get(pocketAPI: PocketAPI, accessInfo: AccessTokenResponse, lastUpdateTimestamp: number, pocketSyncTag: string, itemStore: PocketItemStore, metadataStore: MetadataStore) {
  const getPocketItemsResponse = await pocketAPI.getPocketItems(
    accessInfo.accessToken,
    lastUpdateTimestamp,
    pocketSyncTag
  );

  new Notice(
    `Fetched ${Object.keys(getPocketItemsResponse.response.list).length} updates from Pocket`
  );

  const storageNotice = new Notice(`Storing updates from Pocket...`, 0);

  await itemStore.mergeUpdates(getPocketItemsResponse.response.list);
  await metadataStore.setLastUpdateTimestamp(getPocketItemsResponse.timestamp);

  storageNotice.hide();
}
