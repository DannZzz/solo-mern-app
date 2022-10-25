import { memoize } from "anytool";
import { Database } from "../Database";
import { Users_for_search } from "./Cooldowns";
import SuperUser, { SuperUserJson } from "./SuperUser";


export const getUsers = async (exlcudeIds: string[] = []) => {
    const res = await Database.getModel('User').find((data) => new SuperUser(data));
    return Array.isArray(res) ? res?.filter(user => !exlcudeIds.includes(user._id)) : [];
}
// , () => !Boolean(Users_for_search.isLimited('search'))
export async function searchQuery(query: string, exlcudeIds: string[] = []): Promise<{ users: SuperUserJson[], characteristicUsers: SuperUserJson[] }> {
    const result = {
        byUsername: [],
        byName: [],
        characteristicUsers: [],
    }

    function toForm(r: any) {
        return {
            users: [...r.byUsername, ...r.byName],
            characteristicUsers: r.characteristicUsers
        };
    }

    if (!query) return toForm(result);
    query = query.toLowerCase();

    const symbolGroup = {
        characteristicUsers: "$",
    }

    const users = await getUsers(exlcudeIds || []);
    users.forEach(user => {

        switch (query[0]) {
            case symbolGroup.characteristicUsers:
                if (user?.characteristics?.some(charObj => charObj.text?.toLowerCase().includes(query.slice(1)))) result.characteristicUsers.push(user.data());

            default:
                if (user.name?.toLowerCase().includes(query)) result.byUsername.push(user.data());
                if (user.username.toLowerCase().includes(query)) result.byName.push(user.data());
        }

    })
    return toForm(result);
}


