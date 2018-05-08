export default ({ router }) => {
  router.get('*', (req, res) => res.renderApp());
};
