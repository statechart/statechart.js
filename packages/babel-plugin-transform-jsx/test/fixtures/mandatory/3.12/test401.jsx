<scxml initial="s0" version="1.0">
  <state id="s0">
    <onentry>
      <send event="foo"/>
      <assign location="foo.bar.baz" expr={ 2 }/>
    </onentry>

    <transition event="foo" target="fail"/>
    <transition event="error" target="pass"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
