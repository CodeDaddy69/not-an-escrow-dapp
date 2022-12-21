import type { NextApiRequest, NextApiResponse } from 'next';
import type { Listing } from '../../../lib/helpers/listingtype';

const users = ["8PicuETn3oTfcv1JQzxszzD4A4ecsqz3NdJKpYXmW8VJ"];

type Data = {
    accountId: string,
    isInitialised: boolean,
};


function createListing(listingArgs: Listing ) {

    return;
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
                break;
            case "POST":
                break;
            case "DELETE":
                break;
            default:
                res.status(405).end(`Method ${method} not supported`)
        }
    }
}