// SOURCE: https://app.pizzapets.fun/content/b682519b575664c5ab76f5bc536f813d2eae20522e3c8c8d3414ce51e7c1c02bi0
import { OrdClient } from "/content/031d60cebab0d0e96f15ac512dbe3953ff1586d8e86f2f35e22bac76519bf0dbi3";

const ORD_CLIENT_SAT = 260621444322646;
const DRAW_SAT = 280810779975710;
const CONFIG_SAT = 280810779975715;

export class Ninja {
  #clientReady;

  static async load(images) {
    const ninja = new Ninja();
    await ninja.clientReady;
    const index = await ninja.getUserDrawVersion();
    const drawInscriptionId = await ninja.client.getInscriptionIdForSatAtIndex(
      DRAW_SAT,
      index
    );

    import(OrdClient.prefixedPathFor(drawInscriptionId)).then((module) => {
      module.draw(images, ninja.client, ninja.config);
    });
  }

  constructor() {
    this.clientReady = this.init();
  }

  async init() {
    const clientInscriptionId =
      await new OrdClient().getLatestInscriptionIdForSat(ORD_CLIENT_SAT);
    return import(OrdClient.prefixedPathFor(clientInscriptionId)).then(
      async (module) => {
        this.client = new module.OrdClient();
        const configInscriptionId =
          await this.client.getLatestInscriptionIdForSat(CONFIG_SAT);
        this.config = await this.client.fetchJsonFor(configInscriptionId);
      }
    );
  }

  async getUserDrawVersion() {
    try {
      const fragments = window.location.pathname.split("/");
      const inscriptionId = fragments[fragments.length - 1];
      const userSat = await this.client.getSatForInscriptionId(inscriptionId);
      const latestReinscription =
        await this.client.getLatestInscriptionIdForSat(userSat);
      const childInscription = await this.client.fetchJsonFor(
        latestReinscription
      );
      if (childInscription.project !== this.config.project) {
        throw `child inscription project attribute "${childInscription.project}" does not match "${this.config.project}"`;
      }
      return childInscription.version;
    } catch (e) {
      return this.config.default_user_draw_version;
    }
  }
}
