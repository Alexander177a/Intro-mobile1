import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import{app} from "../../src/firebase/firebaseConfig"
import { useState } from "react";
import { Button, TextInput, View ,Text, StyleSheet} from "react-native";
import { Link, router } from "expo-router";

const Login =()=>{
    const [email,setEmail] = useState("")
    const [password, setPassword] = useState("")

    const auth = getAuth(app);
    const login = ()=>{
        console.log("login");
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        router.replace("../(tabs)/home")
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        alert(errorMessage);
    });
    }

        return(
        <View style={style.page}>
        <View style={style.form}>
            <Text style={{ flex:1}}>LOG IN TO YOUR PLATFORM</Text>
            <View style={style.inputform}>
            <Text >Email:</Text>
            <TextInput style={style.input} onChangeText={setEmail} value={email} />
            <Text>Password:</Text>
            <TextInput style={style.input} secureTextEntry onChangeText={setPassword} value={password}/>
            <Button title="Login" onPress={login} ></Button>
            <Link href={"/register"}>register as new user</Link>
            </View>
        </View>
        </View>

        
    )
    }



export default Login;

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