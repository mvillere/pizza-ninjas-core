// SOURCE: https://app.pizzapets.fun/content/031d60cebab0d0e96f15ac512dbe3953ff1586d8e86f2f35e22bac76519bf0dbi3
const LATEST_INSCRIPTION_INDEX = -1;

export class OrdClient {
  static prefixedPathFor(path, options) {
    options = options || { content: true };
    if (options.content) {
      path = `/content/${path}`;
    }
    return path;
  }

  async fetchJsonFor(path, options) {
    const response = await fetch(
      this.constructor.prefixedPathFor(path, options)
    );
    return await response.json();
  }

  async getInscriptionIdForSatAtIndex(sat, index) {
    const path = `/r/sat/${sat}/at/${index}`;
    const data = await this.fetchJsonFor(path, { content: false });
    return data.id;
  }

  async getLatestInscriptionIdForSat(sat) {
    return this.getInscriptionIdForSatAtIndex(sat, LATEST_INSCRIPTION_INDEX);
  }

  async getSatForInscriptionId(inscriptionId) {
    const path = `/r/inscription/${inscriptionId}`;
    const data = await this.fetchJsonFor(path, { content: false });
    return data.sat;
  }

  fetch(path, options) {
    return fetch(this.constructor.prefixedPathFor(path, options));
  }

  prefixedPathFor(path, options) {
    return this.constructor.prefixedPathFor(path, options);
  }
}
