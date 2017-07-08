import * as Type from "./src/components/helpers/types";
import {Player, IStateType} from "./src/components/player";

const itemRep: {[name: string]: Type.IItem} = {
  letter: {
    name: "letter",
    value: 3,
  },
  getter: {
    name: "getter",
    value: 3,
    use: (state: IStateType) => ({stats: {strength: state.stats.strength + 1}}),
  },
  goldOre: {
    name: "gold ore",
    value: 50,
  },
  preAlphaTester: {
    name: "medallion of the pre-alpha tester",
    use: (state: IStateType): Type.IUseReturnMessage => ({state: {location: {coordinates: {x: 0, y: 0}}},
                                                          message: "You are teleported to The Origin"}),
    value: 0,
  },
};

export default itemRep;
