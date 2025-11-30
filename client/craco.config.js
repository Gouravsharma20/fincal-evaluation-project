module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable CSS minimizer
      webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
        plugin => plugin.constructor.name !== 'CssMinimizerPlugin'
      );
      return webpackConfig;
    }
  }
};