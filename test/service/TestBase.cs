using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;
using Autofac;
using Autofac.Integration.SignalR;
using Microsoft.AspNet.SignalR;

namespace Downloadr.Tests
{
    public class TestBase
    {
        private IContainer _container;

        [TestInitialize]
        public void Compile()
        {
            _container = ComponentTestConfig.Build();

            IoC.Container = _container;
            var resolver = new AutofacDependencyResolver(IoC.Container);
            GlobalHost.DependencyResolver = resolver;
        }

        public TService Resolve<TService>()
        {
            return _container.Resolve<TService>();
        }
    }
}
