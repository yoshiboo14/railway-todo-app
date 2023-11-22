import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import axios from 'axios'
import { Header } from '../components/Header'
import { url } from '../const'
import './home.scss'
import PropTypes from 'prop-types'

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo') // todo->未完了 done->完了
  const [lists, setLists] = useState([])
  const [selectListId, setSelectListId] = useState()
  const [tasks, setTasks] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [cookies] = useCookies()
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value)
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data)
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`)
      })
  }, [])

  useEffect(() => {
    const listId = lists[0]?.id
    if (typeof listId !== 'undefined') {
      setSelectListId(listId)
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks)
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`)
        })
    }
  }, [lists])

  const handleSelectList = (id) => {
    setSelectListId(id)
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks)
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`)
      })
  }

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId
              return (
                <li
                  key={key}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  // キーボード操作を追加
                  tabIndex="0"
                  onClick={() => handleSelectList(list.id)}
                  // フォーカスされたときの処理」
                  onFocus={() => handleSelectList(list.id)}
                >
                  {list.title}
                </li>
              )
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
              // date={date}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

// 表示するタスク
const Tasks = (props) => {
  // prop-types による型チェックの定義
  Tasks.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.object),
    selectListId: PropTypes.number.isRequired,
    isDoneDisplay: PropTypes.string.isRequired,
  }

  const { tasks, selectListId, isDoneDisplay } = props
  if (tasks === null) return <></>

  // ホーム画面の表示(完了)
  if (isDoneDisplay === 'done') {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true
          })
          .map((task, key) => (
            <>
              <li key={key} className="task-item">
                <Link
                  to={`/lists/${selectListId}/tasks/${task.id}`}
                  className="task-item-link"
                >
                  {task.title}
                  <br />
                  {task.done ? '完了' : '未完了'}
                  <br />
                  {/* koko */}
                  {task.limit}
                </Link>
              </li>
            </>
          ))}
      </ul>
    )
  }
  //JSTに変換して表示する関数
  const JST = (limit) => {
    // ここから
    const jst = new Date(limit)
    // console.log(jst)
    // 9時間を加算
    jst.setHours(jst.getHours() + 9)
    // 新しい日時を取得し、ISO 8601形式で表示
    const jst2 = jst.toISOString().slice(0, -5)
    return jst2
  }

  // 残り時間（期限）の作成、表示
  const DeadlineTime = (limit) => {
    const loadDate = new Date()
    // console.log(limit)
    // 期限ー今の時間
    const secTime = new Date(limit).getTime() - loadDate.getTime()
    let hour = Math.floor(secTime / 3600000)
    let min = Math.floor((secTime % 3600000) / 60000)
    let rem = secTime % 60
    // console.log(`${hour}時間${min}分${rem}秒`)
    return `${hour}時間${min}分${rem}秒`
  }

  // ホーム画面の表示(未完了)
  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false
        })
        .map((task, key) => (
          <>
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {task.done ? '完了' : '未完了'}
                <br />
                期限{JST(task.limit)} 残り時間 {DeadlineTime(task.limit)}
                <br />
                <br />
              </Link>
            </li>
          </>
        ))}
    </ul>
  )
}
