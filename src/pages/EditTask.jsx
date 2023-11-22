import React, { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import { url } from '../const'
import { useNavigate, useParams } from 'react-router-dom'
import './editTask.scss'

export const EditTask = () => {
  const history = useNavigate()
  const { listId, taskId } = useParams()
  const [cookies] = useCookies()
  const [title, setTitle] = useState('')
  // 期限機能
  const [limit, setLimit] = useState('')
  // UTCに変換した期限
  const [utcTime, setUtcTime] = useState('')
  const [detail, setDetail] = useState('')
  const [isDone, setIsDone] = useState()
  const [errorMessage, setErrorMessage] = useState('')
  const handleTitleChange = (e) => setTitle(e.target.value)
  // 期限機能
  const handleLimitChange = (e) => {
    // inputはjst
    console.log(e.target.value)
    setLimit(e.target.value)

    // utcに変換
    const jst = new Date(e.target.value)
    console.log(jst)
    const utc = jst.toISOString().slice(0, -5)
    console.log(utc)
    // console.log(utc + 'Z')
    setUtcTime(utc + 'Z')
  }
  const handleDetailChange = (e) => setDetail(e.target.value)
  const handleIsDoneChange = (e) => setIsDone(e.target.value === 'done')
  const onUpdateTask = () => {
    console.log(isDone)

    const data = {
      title: title,
      detail: detail,
      done: isDone,
      // limitを追加
      // limit: limit + 'Z',
      limit: utcTime,
    }

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data
        const utc = task.limit
        console.log(res.data)
        console.log(utc)
        history('/')
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`)
      })
  }

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        history('/')
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`)
      })
  }

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data
        console.log(task.limit) // 期限時間(UTC)をコンソール表示
        setTitle(task.title)

        // UTCで取得した値をJSTに変換
        const utc = new Date(task.limit)
        // console.log(utc)
        utc.setHours(utc.getHours() + 9) // 9時間を加算
        const jst = utc.toISOString().slice(0, -5) // 新しい日時を取得し、ISO 8601形式で表示
        // console.log(jst)
        setLimit(jst) // 最初に取得するインプットのデータ

        setDetail(task.detail)
        setIsDone(task.done)
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`)
      })
  }, [])

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <label>期限</label>
          <br />
          <input
            type="datetime-local"
            step="1"
            onChange={handleLimitChange}
            className="new-task-title"
            value={limit}
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? 'checked' : ''}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? 'checked' : ''}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            // value={limit}
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  )
}
