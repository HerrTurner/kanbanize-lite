import ColumnTitle from './ColumnTitle';
import {useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router'
import Dynamicboard from '../styles/Dynamicboard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCircleArrowLeft, faCircleArrowRight} from '@fortawesome/free-solid-svg-icons';
import {urlCloud} from '../constants'
const cookieCutter= require('cookie-cutter');

type selection = {
    user_id: number | null,
    checked: boolean
}

type user = {
    user_id: number | null,
    username: string,
    realname: string,
    avatar: string
}

type parent_columns = {
    parent_id: number,
    parent_name: string,
    parent_section: number,
    parent_position: number,
} 

export type card = {
    "card_id": number,
    "custom_id": number | null,
    "title": string,
    "owner_user_id": number | null,
    "owner_username": string | null,
    "owner_avatar": string | null,
    "type_id": number | null,
    "color": string,
    "section": number,
    "lane_id": number,
    "position": number,
    "co_owner_usernames" : Array<string> | null,
    "co_owner_avatars" : Array<string> | null,
    "description" : string,
    "comment_count" : number
};

type column = {
  "column_id": number,
  "workflow_id": number,
  "section": number,
  "parent_column_id": Array<parent_columns> | null ,
  "position": number,
  "name": string,
  "description": string,
  "color": string,
  "limit": number,
  "cards_per_row": number,
  "flow_type": number,
  "card_ordering": string | null,
  "cards": Array<card>,
  "order": number
}

type CardsWorkflowProps = {
    data: Array<column>,
    users: Array<user>,
    workflow_name: string,
    updateCurrentCard: any,
    displayModal: any,
    moveCards: any
}

type showButtons = {
    left: boolean,
    right: boolean
};

const CardsWorkflow = ({data, users, workflow_name, updateCurrentCard, displayModal, moveCards} : CardsWorkflowProps) => {
    const router = useRouter();
    const [index, setIndex] = useState<number>(0);
    const [buttons, setButtons] = useState<showButtons>({left: false, right: true});
    const [color, setColor] = useState<string>('#9e9e9e');
    const [activities, setActivities] = useState<Array<card>>([]);
    const [filtered, setFiltered] = useState<Array<card>>([]);
    const [selected, setSelected] = useState<Array<selection>>([]);
    const columns = data;

    const ActivityCard = dynamic(import('../components/ActivityCard'), {ssr:false});
    const [cardIndex, setCardIndex] = useState(0);

    useEffect(()=>{
        setAllSelected(users);
    }, [users]);

    useEffect(()=>{
        setFilteredActivities(data, index, selected);
    }, [data, index, selected]);

    useEffect(()=>{
        setActivities(filtered);
    }, [filtered]);

    const setAllSelected = (u : Array<user>) => {
        const usersselection : Array<selection> = [];
        u.map((element: user) =>{
            usersselection.push({user_id: element.user_id, checked: true});
        })
        setSelected(usersselection);
        setFiltered(data[index].cards);
    }

    const setFilteredActivities = (d: Array<column>, i: number, s:Array<selection>) =>{ 
        const filteredData :  Array<card> = [];
        d[i].cards.map((element: any) => {
                const found = s.find(item => item.user_id == element.owner_user_id);
                if(found !== undefined && found.checked){
                    filteredData.push(element);
                }
        })
        setFiltered(filteredData)
    }

    const setFilter = (temp : Array<selection>) =>{
        setSelected(temp);
        const filteredData :  Array<card> = [];
        data[index].cards.map((element: any) => {
            const found = temp.find(item => item.user_id == element.owner_user_id);
            if(found !== undefined && found.checked){
                filteredData.push(element);
            }
        })
        setFiltered(filteredData)
    }

    const retrieveIndex = (cardIndex: number) =>{
        //retrieve cards index
        setCardIndex(cardIndex);
        const curr = activities!=null ? activities.find(item => item.card_id === cardIndex) : [];

        updateCurrentCard(curr);

    }

    const handleLeftClick = async (card_id : number) => {
        const apikey = cookieCutter.get('apikey');
        const host = cookieCutter.get('host');
        const formData = JSON.stringify({
            "column_id": data[index - 1].column_id,
        });
        const response = await  fetch(urlCloud+`moveCard/${host}/${card_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "apikey": apikey
            },
            body: formData
        })
        if(response.ok) {
            const data : any = await response.json();
            if(data.error){
                cookieCutter.set('apikey', '', { expires: new Date(0) })
                cookieCutter.set('host', '', { expires: new Date(0) })
                cookieCutter.set('email', '', { expires: new Date(0) })
                cookieCutter.set('userid', '', { expires: new Date(0) }) 
                router.replace({pathname: '/'});
            }
            else {
                const cardIndex = activities ? activities.findIndex((ele : card )=> ele.card_id === card_id) : -1;
                moveCards(index, cardIndex, index -1);
                setIndex(index-1);
                if(index-1 === 0){
                    setButtons({left: false, right: true})
                }
                else if(index-1 === data.length-1){
                    setButtons({left: true, right: false})
                }
                else{
                    setButtons({left: true, right: true})
                }
        
                if(columns[index-1].color === ''){
                    setColor('#9e9e9e');
                }
                else{
                    setColor('#'+columns[index-1].color);
                }
            }
        }
        else {
            cookieCutter.set('apikey', '', { expires: new Date(0) })
            cookieCutter.set('host', '', { expires: new Date(0) })
            cookieCutter.set('email', '', { expires: new Date(0) })
            cookieCutter.set('userid', '', { expires: new Date(0) })
            router.replace({pathname: '/'});
        }
    };

    const handleRightClick =  async (card_id : number) => {
        const apikey = cookieCutter.get('apikey');
        const host = cookieCutter.get('host');
        const formData = JSON.stringify({
            "column_id": data[index + 1].column_id,
        });
        const response = await  fetch(urlCloud+`moveCard/${host}/${card_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "apikey": apikey
            },
            body: formData
        })
        if(response.ok) {
            const data : any = await response.json();
            if(data.error){
                cookieCutter.set('apikey', '', { expires: new Date(0) })
                cookieCutter.set('host', '', { expires: new Date(0) })
                cookieCutter.set('email', '', { expires: new Date(0) })
                cookieCutter.set('userid', '', { expires: new Date(0) })
                router.replace({pathname: '/'});
            }
            else{
                const cardIndex = activities ? activities.findIndex((ele : card )=> ele.card_id === card_id) : -1;
                moveCards(index, cardIndex, index + 1)
                setIndex(index+1);
                if(index+1 === 0){
                    setButtons({left: false, right: true})
                }
                else if(index+1 === data.length-1){
                    setButtons({left: true, right: false})
                }
                else{
                    setButtons({left: true, right: true})
                }
        
                if(columns[index+1].color === ''){
                    setColor('#9e9e9e');
                }
                else{
                    setColor('#'+columns[index+1].color);
                }
            }
        }
        else {
            cookieCutter.set('apikey', '', { expires: new Date(0) })
            cookieCutter.set('host', '', { expires: new Date(0) })
            cookieCutter.set('email', '', { expires: new Date(0) })
            cookieCutter.set('userid', '', { expires: new Date(0) })
            router.replace({pathname: '/'});
        }
    };



    const returnResponse = (response : number) =>   {
        setIndex(index+response);
        if(index+response === 0){
            setButtons({left: false, right: true})
        }
        else if(index+response === data.length-1){
            setButtons({left: true, right: false})
        }
        else{
            setButtons({left: true, right: true})
        }

        if(data[index+response].color === ''){
            setColor('#9e9e9e');
        }
        else{
            setColor('#'+data[index+response].color);
        }


    };

    return(
        <>
            

            <div className={Dynamicboard.workflowWrap}>
                <ColumnTitle name={data[index].name} left={buttons.left} right={buttons.right} color={color} returnResponse={returnResponse} parent_column_id={data[index].parent_column_id} workflow_name={workflow_name} users={users} selected={selected} setFilter={setFilter}/>
                <div className={Dynamicboard.grid}>
                    { activities != null && activities.map((element: any) =>
                        <div key={element.key} className={Dynamicboard.cardContainer}>
                            <div className={Dynamicboard.buttons} onClick={() => handleLeftClick(element.card_id)}>
                                {  buttons.left &&
                                    <FontAwesomeIcon icon={faCircleArrowLeft} style={{color: "#000000"}} />
                                }
                            </div>
                            <ActivityCard card_id={element.card_id}  color={element.color} owner_avatar={element.owner_avatar} title={element.title} owner_username={element.owner_username} co_owner_usernames={element.co_owner_usernames} co_owner_avatars={element.co_owner_avatars} description={element.description} retrieveIndex={retrieveIndex} displayModal={displayModal}/>
                            <div className={Dynamicboard.buttons} onClick={() => handleRightClick(element.card_id)}>
                                { !element.is_blocked && buttons.right &&
                                    <FontAwesomeIcon icon={faCircleArrowRight} style={{color: "#000000"}} />
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}


export default CardsWorkflow;