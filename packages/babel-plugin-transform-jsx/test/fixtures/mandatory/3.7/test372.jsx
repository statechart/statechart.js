<scxml version="1.0">
  <datamodel>
    <data id="Var1" expr={ 1 }/>
  </datamodel>

  <state id="s0" initial="s0final">
    <onentry>
      <send event="timeout" delay="1s"/>
    </onentry>

    <transition event="done.state.s0" cond={ ({ Var1 }) => Var1 == 2 } target="pass" />
    <transition event="*" target="fail"/>

    <final id="s0final">
      <onentry>
        <assign location="Var1" expr={ 2 }/>
      </onentry>
      <onexit>
        <assign location="Var1" expr={ 3 }/>
      </onexit>
    </final>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
