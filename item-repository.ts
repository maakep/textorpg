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
    use: (state: IStateType): Type.IUseReturnMessage => {
      const newState = state;
      newState.stats.stamina.max += 1;
      const returnMsg: Type.IUseReturnMessage = {
        state: newState,
        message: "You feel your cardio increasing to " + newState.stats.stamina.max,
      };
      return returnMsg;
    },
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
