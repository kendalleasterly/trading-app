const {initializeApp, cert} = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const serviceAccount = require("./automated-liquidity-manager-dc30847f3689.json")

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

function addPosition({id, liquidity, pool, tickLower, tickUpper}) {

    db.collection("positions").doc(id.toString()).set({
            liquidity,
            pool,
            tickLower,
            tickUpper,
            creationTime: FieldValue.serverTimestamp()
        })

}

function getMostRecentPosition() {
    
    return new Promise((resolve, reject) => {

        db.collection("positions").orderBy("creationTime", "desc").get().then(docs => {
            docs.forEach(doc => {
                const id = doc.id

                const data = doc.data()

                console.log("in func", id, data)

                resolve({
                    id,
                    ...data
                })
            })
        })
    }) 
}

module.exports = {addPosition, getMostRecentPosition};