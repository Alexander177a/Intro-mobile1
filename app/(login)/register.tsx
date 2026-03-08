import { Button, TextInput, View,Text,StyleSheet } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {app} from "../../src/firebase/firebaseConfig"
import { router } from "expo-router";

const Register =()=>{
    const [email,setEmail] =useState("");
    const [password,setPassword] = useState("");

    const auth = getAuth(app);

    const registerUser=()=>{
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                
                router.back()
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode)
                alert(errorMessage)
            });
        };

     return(
            <View style={style.page}>
            <View style={style.form}>
                <Text style={{ flex:1}}>MAKE YOUR ACCOUNT</Text>
                <View style={style.inputform}>
                <Text >Email:</Text>
                <TextInput style={style.input} onChangeText={setEmail} value={email} />
                <Text>Password:</Text>
                <TextInput style={style.input} secureTextEntry onChangeText={setPassword} value={password}/>
                <Button title="Register" onPress={registerUser} ></Button>
                </View>
            </View>
            </View>
    )

}


export default Register;

const style= StyleSheet.create({
    page:{
        flex:1,
        justifyContent: "center",
        alignItems:"center",
        backgroundColor:"grey"
    },
    form:{
        height:"80%",
        backgroundColor:"white",
        padding:50 ,
        alignItems:"center"
    },
    inputform:{
        flex:3,
        justifyContent:"space-between",
    },
    input:{
        borderWidth:1,
        padding:10
    }


})