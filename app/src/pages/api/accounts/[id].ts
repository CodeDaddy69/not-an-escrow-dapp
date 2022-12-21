import type { NextApiRequest, NextApiResponse } from 'next';

const users = ["8PicuETn3oTfcv1JQzxszzD4A4ecsqz3NdJKpYXmW8VJ"];

type Data = {
    accountId: string,
    isInitialised: boolean,
};

function isInitialised(accountId: string ) {
    const isInitialised = users.includes(accountId);
    const account: Data = {
        accountId: accountId,
        isInitialised: isInitialised
    };
    return account;
}

function addAccount(accountId: string ) {
    users.push(accountId);

    const account: Data = {
        accountId: accountId,
        isInitialised: true
    };
    return account;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    
    const method = req.method;
    const id = req.query.id;

    console.log(id);

    if (!(typeof id === 'string')) {res.status(400)}
    else {

        let result;

        switch(method) {
            case "GET":
                result = isInitialised(id);
                res.status(200).json(result);
                break;
            case "POST":
                result = addAccount(id)
                res.status(201).json(result);
                break;
            case "DELETE":
                // TODO: add delete user logic
                break;
            default:
                res.status(405).end(`Method ${method} not supported`)
        }
    }
}