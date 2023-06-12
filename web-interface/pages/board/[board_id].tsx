// pages/board/[board_id].tsx
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import type { GetServerSideProps } from 'next'
import authRoute from '../../components/authRoute';
import CardsWorkflow from '../../components/CardsWorkflow';
import InitiativesWorkflow from '../../components/InitiativesWorkflow';
import FloatButton from '../../components/FloatButton';
import {useEffect, useState, useRef, useLayoutEffect} from "react";
import dynamic from 'next/dynamic';
import { urlCloud } from '../../constants'
import dashboard from '../../styles/Dashboards.module.css';
import Cookies from 'cookies';
import {useRouter} from 'next/router';
import { workflow, card, user, selection, } from '@/types/types';
import NewCardComponent from '../../components/NewCardComponent';
import OpenedInitiativeCard from '../../components/OpenedInitiativeCard';
import Swal from 'sweetalert2'
const cookieCutter= require('cookie-cutter');

import Image from 'next/image';
import Sidebar from '../../components/Sidebar';
import Link from 'next/link';

type Props = {}

type NextJsI18NConfig = {
  defaultLocale: string
  domains?: {
    defaultLocale: string
    domain: string
    http?: true
    locales?: string[]
  }[]
  localeDetection?: false
  locales: string[]
}
  
interface PropsResponse {
  data: Array<workflow> | Error,
  _nextI18Next: NextJsI18NConfig
}

const Board = (props: PropsResponse) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [pageLoaded, setPageLoaded] = useState(false);
  const InterfaceDropdown = dynamic(import('../../components/InterfaceDropdown'), { ssr: false });
  const OpenedActivityCard = dynamic(import('../../components/OpenedActivityCard'), { ssr: false });

  const [currentCard, setCurrentCard] = useState<card>()
  const [currentInitiativeCard, setCurrentInitiativeCard] = useState<card>();

  const [displayCard, setDisplayCard] = useState<boolean>(false);
  const [displayInitiativeCard, setDisplayInitiativeCard] = useState<boolean>(false);
  const [retrievedWorkflow, setRetrievedWorflow] = useState<boolean>(false);
  const [resetIndex, setResetIndex] = useState<number>(0);
  
  const [insertCard, setInsertCard] = useState<boolean>(false);
  const [ newCardPosition, setNewCardPosition] = useState<number>(0);

  const [returnToBacklog, setReturnToBacklog] = useState<boolean>(false);

  const pageRef = useRef<any>(null);
  const [pageWidth, setPageWidth] = useState<{width: number;}>({width:0})

  const userId = cookieCutter.get('userid');

  const activateInsertCard = (param: boolean) =>{
    setInsertCard(param);

    if(!insertCard){

      const cutUsers : Array<user> = [];
      const usersselection : Array<selection> = [];


      workflow.users.map((element: user, index) =>{
        if(element.user_id!=null && element.user_id!=userId){
            usersselection.push({user_id: element.user_id, checked: false});
        }

        if(index<workflow.users.length-1 && element.user_id!=userId && element.user_id!=null){
            cutUsers.push(element);
        }
      })

      setNewUsers(cutUsers); //newUsers
      setSelected(usersselection); //selected

    }
  }

  const [workflow, setWorkflow] = useState<workflow>({
    "type": -1,
    "position": -1,
    "is_enabled": -1,
    "is_collapsible": -1,
    "name": "",
    "workflow_id": -1,
    "users" : [],
    "columns": [],
    "lanes": [],
  });


  const query = router.query;
  const board_id = query.board_id;
  const board = props.data.error ? [] : props.data;

  useEffect(() => {
    if(props.data.error){
      cookieCutter.set('apikey', '', { expires: new Date(0) });
      cookieCutter.set('host', '', { expires: new Date(0) });
      cookieCutter.set('email', '', { expires: new Date(0) });
      cookieCutter.set('userid', '', { expires: new Date(0) });
      cookieCutter.set('avatar', '', { expires: new Date(0) });
      cookieCutter.set('username', '', { expires: new Date(0) });
      cookieCutter.set('workspace', '', { expires: new Date(0) });
      router.replace({pathname: '/'});
      if(props.data.error === 429){
        const Toast = Swal.mixin({
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: false,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })             
        Toast.fire({
          icon: 'error',
          title: 'Muchas peticiones'
        })
      }
      else if(props.data.error === 401){
        const Toast = Swal.mixin({
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: false,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })             
        Toast.fire({
          icon: 'error',
          title: 'Token inválido'
        })
      }
      else{
        const Toast = Swal.mixin({
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: false,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })             
        Toast.fire({
          icon: 'error',
          title: 'Error'
        })
      }
    }
    else{
      setPageLoaded(true);
    }
  }, [props.data, router])

  useEffect(() => {
    if(pageLoaded){
      const temp = board.filter(function (item) { return item.type === 0});
      if(temp.length > 0){
        setWorkflow(temp[0]);
        setRetrievedWorflow(true);
        setResetIndex(0);
      }
      else{
        setWorkflow(board[board.length-1]);
        setRetrievedWorflow(true);
        setResetIndex(0);
      }
    }
  }, [pageLoaded, board])
  

  const getWorkflow = (workflowid: number) => {
    const temp = board.filter(function (item) { return item.workflow_id === workflowid; })[0];
    setWorkflow(temp);
    setRetrievedWorflow(true);
    setResetIndex(0);
  }

  const updateCurrentInitiativeCard = (curr: card) =>{
    setCurrentInitiativeCard(curr);
  }


  const updateCurrentCard = (curr: card) =>{
    setCurrentCard(curr);
  }
  
  const moveCards = (current : number, cardIndex : number, destiny: number ) =>{
    
    const tempWorkflow = workflow;

    if(tempWorkflow!=null){

      if(tempWorkflow.columns[current].cards != null){
        tempWorkflow.columns[destiny].cards?.push(tempWorkflow.columns[current].cards[cardIndex]);
      }
      
      tempWorkflow.columns[current].cards?.splice(cardIndex, 1);
      setWorkflow(tempWorkflow)
  
    }
  }

  const insertCardUpdate = (newCard : card) =>{
    const tempWorkflow : workflow = workflow;


    if(tempWorkflow!=null){
      tempWorkflow.columns[0].cards.push(newCard);
      setNewCardPosition(workflow.columns[0].cards.length + 1);
    }

    setWorkflow(tempWorkflow);
  }

  const applyInsertEffect = (val : boolean) =>{
    setReturnToBacklog(val);
  }



  const showModal = (value: boolean) =>{
    setDisplayCard(value);
  }

  const showInitiativeModal = (value: boolean) =>{
    setDisplayInitiativeCard(value);
  }

  const [newUsers, setNewUsers] = useState<Array<user>>([]);
  const [selected, setSelected] = useState<Array<selection>>([]);

  const setAllSelected = (u : Array<user>) => {
  const cutUsers : Array<user> = [];
  const usersselection : Array<selection> = [];

    u.map((element: user, index) =>{
        if(element.user_id!=null && element.user_id!=userId){
            usersselection.push({user_id: element.user_id, checked: false});
        }

        if(index<u.length-1 && element.user_id!=userId && element.user_id!=null){
            cutUsers.push(element);
        }
    })

    setNewUsers(cutUsers); //newUsers
    setSelected(usersselection); //selected
}

  useEffect(()=>{
    if(pageLoaded){
      setAllSelected(workflow.users);
    }
  }, [pageLoaded, workflow.users])

  const updateSelected = (newSelected: Array<selection>) =>{
    setSelected(newSelected);
  }

  console.log(workflow);

  return (
    <>
    
    <div className={dashboard.pageWrap} ref={pageRef}>
      <div className={dashboard.modalWrap}>

          {displayCard && currentCard!=undefined && <OpenedActivityCard openedCardOwner={t('openedCard.owner')} openedCardCoowner={t('openedCard.co-owner')} openedCardAddComment={t('openedCard.addComment')} openedCardComments={t('openedCard.comments')} title={currentCard.title} owner={currentCard.owner_username} owner_avatar={currentCard.owner_avatar} co_owner_usernames={currentCard.co_owner_usernames} co_owner_avatars={currentCard.co_owner_avatars} description={currentCard.description} setDisplayCard={setDisplayCard} color={currentCard.color} card_id={currentCard.card_id} comment_count={currentCard.comment_count}/>}
      
      </div>

      <div className={dashboard.modalWrap}>
        {displayInitiativeCard && currentInitiativeCard !=undefined && <OpenedInitiativeCard  openedCardOwner={t('openedCard.owner')} openedCardCoowner={t('openedCard.co-owner')} openedCardAddComment={t('openedCard.addComment')} openedCardComments={t('openedCard.comments')} openedCardActivities={t('openedCard.activities')}  title={currentInitiativeCard.title} owner={currentInitiativeCard.owner_username} owner_avatar={currentInitiativeCard.owner_avatar} co_owner_usernames={currentInitiativeCard.co_owner_usernames} co_owner_avatars={currentInitiativeCard.co_owner_avatars} description={currentInitiativeCard.description} setDisplayCard={setDisplayInitiativeCard} color={currentInitiativeCard.color} card_id={currentInitiativeCard.card_id} comment_count={currentInitiativeCard.comment_count} linked_cards={currentInitiativeCard.linked_cards}/>}
      </div>

      
      <div className={dashboard.modalWrap}>

        {insertCard && <NewCardComponent newCardTitle={t('newCard.title')} newCardDescription={t('newCard.description')} newCardOwner={t('newCard.owner')} newCardCoowner={t('newCard.co-owner')} newCardCreate={t('newCard.create')} users={newUsers} activateInsertCard={activateInsertCard} color={'#42AD49'} selected={selected} lane_id={workflow.lanes[0].lane_id} column_id={workflow.columns[0].column_id} updateSelected={updateSelected} position={newCardPosition} insertCardUpdate={insertCardUpdate} applyInsertEffect={applyInsertEffect} updateCurrentCard={updateCurrentCard} lane_name={workflow.lanes[0].name} lane_color={workflow.lanes[0].color}/>}

      </div>

      <div className={dashboard.boardPageWrapScroll}>

        <div className={dashboard.topBar} style={{position: 'fixed', zIndex:'2'}}>
          <div className={dashboard.left}>
            <div>
              <Link href={'/dashboard'}>
                <Image src={"/logo.svg"} width={64} height={36} />
              </Link>
            </div>
            <div className={dashboard.dropdownFragment}>
              <InterfaceDropdown data={board} name={t('board.workflows')} getData={getWorkflow} />
            </div>
          </div>
          {<div className={dashboard.menu}>
            <Sidebar workspaces={t('sidebar.workspaces')} LogOut={t('sidebar.logout')} confirmlogout={t('sidebar.confirmlogout')} cancellogout={t('sidebar.cancellogout')} loggedout={t('sidebar.loggedout')}/>
          </div>}
        </div>


        <div>
          { workflow.type === 0 && 
            <CardsWorkflow filterSelectAll={t('filter.selectAll')} data={workflow.columns} users={workflow.users} workflow_name={workflow.name} updateCurrentCard={updateCurrentCard} displayModal={showModal} moveCards={moveCards}  goBack={returnToBacklog} applyInsertEffect={applyInsertEffect}/>
          }

          {workflow.type === 1 &&
            <InitiativesWorkflow filterSelectAll={t('filter.selectAll')} data={workflow.columns} users={workflow.users} workflow_name={workflow.name} showInitiativeModal = {showInitiativeModal} updateCurrentInitiativeCard = {updateCurrentInitiativeCard}/>
          }

        </div>
      </div>


    </div>

          {
            workflow.type === 0 && 
            <FloatButton activateInsertCard={activateInsertCard}/>
          }

    </>

  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const cookies = new Cookies(context.req, context.res)
  const apikey: any = cookies.get('apikey');
  const host = cookies.get('host');
  const { board_id } = context.query;
  const response = await fetch(urlCloud + `boardDetails/${host}/${board_id}`, {
    method: "GET",
    headers: {
      "apikey": apikey
    },
  })

  const data: any = await response.json();
  return {
      props: {
      ...(await serverSideTranslations(context.locale ?? 'en', [
        'common'
      ])),
      data
    }
  }
}

export default authRoute(Board);
