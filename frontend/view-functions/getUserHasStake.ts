import { aptosClient } from "@/utils/aptosClient";

export const getUserHasStake = async (accountAddress: string | undefined): Promise<boolean> => {
  try {
    const userHasStaked = await aptosClient().view<[boolean]>({
      payload: {
        function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::exists_user_stake`,
        functionArguments: [accountAddress],
      },
    });

    return userHasStaked[0];
  } catch (error: any) {
    return false;
  }
};
