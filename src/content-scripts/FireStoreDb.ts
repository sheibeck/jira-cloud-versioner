
import { getFirestore, updateDoc } from "firebase/firestore";
import { collection, addDoc, getDocs, deleteDoc, query, where, getDoc} from "firebase/firestore"; 
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from "../plugins/firebase_config";
import { Version } from "./Version";
import { version } from "os";
import { async } from "@firebase/util";
import { remove } from "fs-extra";

export class FireStoreDb {
    app;
    db;

    constructor() {        
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
    }

    save = async (versions: Array<Version>) => {         
        versions.forEach( async (version) => {
            try {
            const doc = await this.fetch(version.Number, version.CodeBase);
                if (doc != null) {
                    await updateDoc(doc, JSON.parse(JSON.stringify(version)));       
                }
                else {
                    await addDoc(collection(this.db, "versions"), JSON.parse(JSON.stringify(version)));                
                }
            }
            catch (e) {
                console.error("Error saving document: ", e);
            }
        })               
    }

    delete = async (version: Version) => {        
        try {
            const doc = await this.fetch(version.Number, version.CodeBase);
            if (doc != null) {
                await deleteDoc(doc);       
            }
        }
        catch (e) {
            console.error("Error deleting document: ", e);
        }    
    } 

    fetch = async(versionNumber, codeBase) => {
        // Create a reference to the cities collection        
        const docRef = collection(this.db, "versions");

        // Create a query against the collection.
        const q = query(docRef, where("Number", "==", versionNumber), where("CodeBase", "==", codeBase));
        
        const querySnapshot = await getDocs(q);  
        if (querySnapshot.empty) {
            return null;
        }
        else {
            return querySnapshot.docs[0].ref;
        }
    }

    fetchAll = async() => {
        var versions = new Array<Version>();
        const querySnapshot = await getDocs(collection(this.db, "versions"));
        querySnapshot.forEach((doc) => {
            versions.push(doc.data() as Version);
        });

        return versions;
    }
}