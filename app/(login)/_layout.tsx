import { Stack } from "expo-router"

const RootLayout=()=>{
return( 
    <Stack>
        <Stack.Screen name="index"></Stack.Screen>
        <Stack.Screen name="register"></Stack.Screen>
    </Stack>
)
}

export default RootLayout