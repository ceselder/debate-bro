import type { NextApiRequest, NextApiResponse } from "next";

export const auth = (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.body.data);
    if (req.body.data === process.env.ADMIN_PAGE_PASSWORD) {
        return res.status(200).send("ok");
    } else {
        return res.status(401).send("unauthorized");
    }
}

export default auth;