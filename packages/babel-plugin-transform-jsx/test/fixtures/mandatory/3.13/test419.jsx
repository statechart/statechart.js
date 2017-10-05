<scxml version="1.0" initial="s1">
  <state id="s1">
    <onentry>
      <raise event="internalEvent"/>
      <send event="externalEvent"/>
    </onentry>

    <transition event="*" target="fail"/>
    <transition target="pass"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
