import itemRep from "./item-repository";
import * as Type from "./src/components/helpers/types";

function itemGenerator(items: Type.IItem[], location: Type.ILocation, minuteInterval: number, maxItems: number) {
  setInterval(() => {
    if (location.items.length <= maxItems) {
      items.forEach((item) => {
        location.items.push(item);
      });
    }
  }, minuteInterval * 1000 * 60);
}

const world: Type.ILocation[] = [
  {
    coordinates: { x: 0, y: 0 },
    desc: "A protective one way protective barrier. ",
    items: [itemRep.preAlphaTester],
    spawner: (l) => itemGenerator([itemRep.preAlphaTester], l, 0.01, 1),
    isBlocker: true,
  },
  {
      coordinates: { x: 1, y: 1 },
      items: [itemRep.letter, itemRep.getter, itemRep.preAlphaTester],
      desc: "It's a beautiful area. ",
  },
  {
      coordinates: { x: -1, y: -1 },
      isBlocker: true,
  },
  {
    coordinates: {x: 0, y: 1},
    items: [],
    spawner: (location) => itemGenerator([itemRep.goldOre, itemRep.letter], location, 0.1, 6),
  },
];

export default world;
