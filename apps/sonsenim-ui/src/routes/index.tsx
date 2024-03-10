import { createFileRoute, redirect } from '@tanstack/react-router';
export const Route = createFileRoute('/')({
  component: Index,
  beforeLoad: function() {
    const userToken = localStorage.getItem('userToken')
    if (!userToken) {
      throw redirect({
        to: '/login',
      })
    }
  }
})

function Index() {
  return (
    <div className="p-2">
      <h3>Index page</h3>
    </div>
  )
}
