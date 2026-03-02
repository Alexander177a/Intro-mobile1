import { Link } from "expo-router";
import React, { Children, ReactNode } from "react";
import { Pressable, ScrollView, Text, View, ViewStyle,Image } from "react-native";

const Index = () => {
  return (

    <>
    <View style={{flex:1}}>
    <HeaderView color="skyblue" flex={1}>
      <Text>Startpagina PADEL sport</Text>
    </HeaderView>
    
  
    <BodyView color="red" flex={7}>
        <HeaderView 
          color="green" 
          flex={0.5}
          >
          <Text>Tijd voor de wedstrijs</Text>
        </HeaderView>

        <BodyView color="yellow" flex ={7}>
          <View 
            id="Menu interface" 
            style={{flex:1, backgroundColor:"red"}}
            > 
            <BodyView 
              color="yellow" 
              flex={1} 
              style={{
                flexDirection:"row", 
                justifyContent:"center",
                gap:20, 
                alignItems:"center"
              }}
              >
              <Link href='./features/locations' style={{fontSize:20} }> 
                    <View >
                      <Image source={require('../assets/images/icon.png')}
                      style={{height:40, width:40}}/>
                      <Text>baan zoeken </Text>
                    </View>
              </Link>
              <Link href="..">lessen </Link>
              <Link href="..">wedstrijd</Link>
              <Link href="..">match</Link>
            </BodyView>
          </View>

          <BodyView color="black" flex={3}></BodyView>
        </BodyView>

    </BodyView>

    </View>
    </>


  );
}

type HeaderViewProps ={
  color:string,
  children? :ReactNode
  flex:number
}
const HeaderView = ({color,children, flex}: HeaderViewProps) => {
  return(
    <View style={{backgroundColor:color
      ,flex:flex
    }}>
      {children}
    </View>
)}


type BodyViewProps ={
  color:string,
  children?:ReactNode,
  flex:number
  style?:ViewStyle
}

const BodyView =({color,children,flex, style}:BodyViewProps)=>{
  return(
    <View style={[{backgroundColor:color,
        flex:flex
    },style]}>
      {children}
    </View>
  )
}




export default Index;

