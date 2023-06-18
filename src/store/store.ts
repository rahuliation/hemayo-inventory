import { Atom, PrimitiveAtom, WritableAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import _ from "lodash";
import { Inventory } from "../schema";
import { User } from "firebase/auth";

const store = {
  userStore: {
    user: atom<User | undefined>(undefined),
    inventories: atom<Inventory[]| undefined>([]),
    activeInventory: atom<Inventory| undefined>(undefined)
  },
};

export const useMyStore = <T, Args> (getStore: (myStore: typeof store ) => PrimitiveAtom<T>) => {
  const theatom = getStore(store)
  if(!theatom) {
    throw new Error('path not correct')
  }
  const settrGetter = useAtom(theatom)
  return settrGetter;
};
