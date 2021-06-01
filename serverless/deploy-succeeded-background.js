exports.handler = async function (event) {
  const { payload } = JSON.parse(event.body)

  console.log("payload", payload)
  console.log("env", process.env)
}
