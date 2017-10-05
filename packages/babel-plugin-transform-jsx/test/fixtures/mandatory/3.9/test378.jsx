<scxml version="1.0">
  <datamodel>
    <data id="Var1" expr={ 1 }/>
  </datamodel>

  <state id="s0">
    <onexit>
      <send target="baz" event="event1"/>
    </onexit>
    <onexit>
      <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
    </onexit>

    <transition target="s1"/>
  </state>

  <state id="s1">
    <transition cond={ ({ Var1 }) => Var1 == 2 } target="pass"/>
    <transition target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
