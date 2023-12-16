import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const {recordId} = params;
    const db = await clientPromise();
    const Record = db.collection('records');


    const [record] = await Record.find({_id: recordId}).toArray();
    
    return {recordId, record};
}

